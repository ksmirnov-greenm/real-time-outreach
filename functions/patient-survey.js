const PATIENTS_SURVEY_RESOURCE = 'PatientsSurveys';

const Analytics = require('analytics-node');
const analytics = new Analytics('GWAsAPuFHWAz6VQvIOLCvzLhFTXfisww',{ flushAt: 20 }); //TODO: set key from config
analytics.flushed = true;

function create_UUID() {
  var dt = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
}

exports.handler = async function (context, event, callback) {
  const THIS = 'FUNCTION: /patient-surveys';

  const { getParam } = require(Runtime.getFunctions()['helpers'].path);
  const { fetchSyncDocuments, upsertSyncDocument } = require(Runtime.getFunctions()['datastore/datastore-helpers'].path);
  const TWILIO_SYNC_SID = await getParam(context, 'TWILIO_SYNC_SID');

  try {
    const response = new Twilio.Response();
    response.appendHeader('Content-Type', 'application/json');
    if (context.DOMAIN_NAME.startsWith('localhost:')) {
      response.appendHeader('Access-Control-Allow-Origin', '*');
      response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
      response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
    }

    const listDocuments = await fetchSyncDocuments(context, TWILIO_SYNC_SID);
    console.log(listDocuments);
    console.log(event);
    const client = context.getTwilioClient();


    switch (event.action) {
      case 'SCHEDULE': {
        //TODO: schedule message
        response.setBody({});
        response.setStatusCode(200);
        return callback(null, response);
      }
      case 'TRIGGER': {
    
        //TODO: set flow sid from config
        await client.studio.flows('FWf5164031e7b7727c75c12b24b90c0c5b')
          .executions
          .create({
            to: event.data.patient.patientPhone,
            from: '+17087667625', //todo: set phone from config
            parameters: {
              //TODO: use url from config
              survey_link: 'https://real-time-outreach-2951-dev.twil.io/survey?runId=' + event.data.runId,
              run_id: event.data.runId //needs to add event to segment after sms
            }
          });
        
        

        analytics.track({
          userId: event.data.patient.patientId,
          event: 'Survey sms outreach attempt',
          properties: {
            surveyId: event.data.survey.id,
            outreachMethod: 'sms'
          }
        });

        await analytics.flush(function (err, batch) {
          console.log('Flushed, and now this program can exit!');
        });


        response.setBody({});
        response.setStatusCode(200);
        return callback(null, response);
      }

      case 'CREATE': {
        const patientListDocument = listDocuments.find(d => d.sid === event.data.patientListSid);
        const surveyDocument = listDocuments.find(d => d.sid === event.data.surveySid);
        const queue = patientListDocument.data.patientList.map(patient => {

          //send identfy event to Segment
          analytics.identify({
            userId: patient.patientId,
            traits: {
              //TODO: need more info?
              fistName: patient.patientFirstName,
              lastName: patient.patientLastName,
              phone: patient.patient_phone
            }
          });

          return {
            runId: create_UUID(),
            patientId: patient.patientId,
            surveyId: surveyDocument.data.survey.id
          }
        });

        const res = await upsertSyncDocument(context, TWILIO_SYNC_SID, PATIENTS_SURVEY_RESOURCE, { queue });

        await analytics.flush(function (err, batch) {
          console.log('Flushed, and now this program can exit!');
        });

        response.setBody(queue);
        response.setStatusCode(200);
        return callback(null, response);
      }
      case 'GET': {
        const patientSurveyDocument =  listDocuments.find(d => d.uniqueName === PATIENTS_SURVEY_RESOURCE);
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
    return callback(err);
  }

};