const PATIENTS_SURVEY_RESOURCE = 'PatientsSurveys';

const Analytics = require('analytics-node');
const analytics = new Analytics('GWAsAPuFHWAz6VQvIOLCvzLhFTXfisww', { flushAt: 20 }); //TODO: set key from config
analytics.flushed = true;

function create_UUID() {
  let dt = new Date().getTime();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

exports.handler = async function (context, event, callback) {
  const THIS = 'FUNCTION: /patient-surveys';

  const { getParam } = require(Runtime.getFunctions()['helpers'].path);
  const { fetchSyncDocuments, upsertSyncDocument, removeLists } = require(Runtime.getFunctions()['datastore/datastore-helpers'].path);
  const { triggerSMSWebFlow, triggerIVRFlow } = require(Runtime.getFunctions()['studio-flow'].path);
  const TWILIO_SYNC_SID = await getParam(context, 'TWILIO_SYNC_SID');
  const TWILIO_MESSAGING_SERVICE = await getParam(context, 'TWILIO_MESSAGING_SERVICE');
  const TWILIO_SCHEDULE_PHONE_NUMBER = await getParam(context, 'TWILIO_SCHEDULE_PHONE_NUMBER');

  try {
    const response = new Twilio.Response();
    response.appendHeader('Content-Type', 'application/json');
    if (context.DOMAIN_NAME.startsWith('localhost:')) {
      response.appendHeader('Access-Control-Allow-Origin', '*');
      response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
      response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
    }

    const listDocuments = await fetchSyncDocuments(context, TWILIO_SYNC_SID);

    const client = context.getTwilioClient();


    switch (event.action) {
      case 'SCHEDULE': {
        const msgBody = { runId: event.data.runId, method: event.data.outreachMethod };
        const res = await client.messages
          .create({
            messagingServiceSid: TWILIO_MESSAGING_SERVICE,
            body: JSON.stringify(msgBody),
            sendAt: event.scheduleDate,
            scheduleType: 'fixed',
            // statusCallback: 'https://webhook.site/xxxxx', //TODO: probably use it to track status of message
            to: TWILIO_SCHEDULE_PHONE_NUMBER
          });
        console.log(res);
        response.setBody(res);

        //TODO: define all events in one place
        let scheduled_event = '';
        switch (event.data.outreachMethod) {
          case 'sms-web': {
            scheduled_event = 'SMS/Web survey outreach scheduled';
            break;
          }
          case 'ivr': {
            scheduled_event = 'IVR/IVR survey outreach scheduled';
            break;
          }
          case 'sms': {
            scheduled_event = 'SMS/SMS survey outreach scheduled';
            break;
          }
        }
        analytics.track({
          userId: event.data.patientId,
          event: scheduled_event,
          properties: {
            surveyId: event.data.surveyId,
            outreachMethod: event.data.outreachMethod
          }
        });

        await analytics.flush(function (err, batch) {
          console.log('Flushed, and now this program can exit!');
        });


        response.setStatusCode(200);
        return callback(null, response);
      }
      case 'TRIGGER_SMS_WEB': {
        const res = await triggerSMSWebFlow(client, context, event.data);
        response.setBody({});
        response.setStatusCode(200);
        return callback(null, response);
      }

      case 'TRIGGER_IVR': {
        const res = await triggerIVRFlow(client, context, event.data, event.survey);
        response.setBody({});
        response.setStatusCode(200);
        return callback(null, response);
      }

      case 'CREATE': {
        const patientListDocument = listDocuments.find(d => d.sid === event.data.patientListSid);
        console.log('*********patientListDocument', patientListDocument);

        const surveyDocument = listDocuments.find(d => d.sid === event.data.surveySid);
        const queue = patientListDocument.data.patientList.map(patient => {

          //send identfy event to Segment
          analytics.identify({
            userId: patient.patientId,
            traits: {
              //TODO: need more info?
              fistName: patient.patientFirstName,
              lastName: patient.patientLastName,
              phone: patient.patientPhone
            }
          });

          //TODO: need more info for further analytics?
          return {
            runId: create_UUID(),
            patientId: patient.patientId,
            surveyId: surveyDocument.data.survey.id,
            patientPhone: patient.patientPhone,
            patientListSid: patientListDocument.sid,
            surveySid: surveyDocument.sid,
            outreachMethod: event.data.outreachMethod
          }
        });

        const res = await upsertSyncDocument(context, TWILIO_SYNC_SID, PATIENTS_SURVEY_RESOURCE, { queue });
        await removeLists(context, TWILIO_SYNC_SID);

        await analytics.flush(function (err, batch) {
          console.log('Flushed, and now this program can exit!');
        });

        response.setBody(queue);
        response.setStatusCode(200);
        return callback(null, response);
      }
      case 'GET': {
        const patientSurveyDocument = listDocuments.find(d => d.uniqueName === PATIENTS_SURVEY_RESOURCE);
        console.log(patientSurveyDocument.data);
        response.setBody(patientSurveyDocument);
        response.setStatusCode(200);
        return callback(null, response);
      }
      default: {
        response.setBody({ message: 'Neither a ADD or GET action' });
        response.setStatusCode(401);
        return callback(null, response);
      }
    }
  } catch (err) {
    console.log(THIS, err);
    const response = new Twilio.Response();
    response.appendHeader('Content-Type', 'application/json');
    if (context.DOMAIN_NAME.startsWith('localhost:')) {
      response.appendHeader('Access-Control-Allow-Origin', '*');
      response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
      response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
    }
    response.setStatusCode(err.status);
    response.setBody(err);

    //return callback(err);
    return callback(null, response);
  }

};
