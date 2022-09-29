exports.handler = async function (context, event, callback) {
  const THIS = 'FUNCTION: /send-alert-sms';

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
    console.log(event);
    const client = context.getTwilioClient();

    const from_phone = await getParam(context, 'TWILIO_FROM_PHONE_NUMBER');
    const admin_phone = await getParam(context, 'ADMINISTRATOR_PHONE_NUMBER');
    const to_phone = (event.to_phone) ? event.to_phone : admin_phone;


    const listDocuments = await fetchSyncDocuments(context, TWILIO_SYNC_SID);
    const patientSurveyDocument = listDocuments.find(d => d.uniqueName === 'PatientsSurveys'); //todo: replace
    const run = patientSurveyDocument.data.queue.find(d => d.patientId === event.userId);

    if (!run) {
      response.setBody({ message: 'Can not find run for this runId' });
      response.setStatusCode(404);
      return callback(null, response);
    }


    const patient = listDocuments.find(d => d.sid === run.patientListSid).data.patientList.find(p => p.patientId === event.userId);
    if (patient) {
      let body = '';
      if (event.properties && event.properties.sentiment === 'NEGATIVE') {
        body = 'Hi, you have got negative feedback from patient ' + patient.patientFirstName + ' ' + patient.patientLastName;
      }  
      if (event.event && event.event === 'Survey completed') { //TODO: use shared name
        body = 'Hi, patient ' + patient.patientFirstName + ' ' + patient.patientLastName + 'completed survey';
      }  
      if(body !== '') {
        const message = await client.messages.create({
          body: body,
          from: from_phone,
          to: to_phone,
        });
      }
    }

    response.setBody({});
    response.setStatusCode(200);
    return callback(null, response);

  } catch (err) {
    console.log(THIS, err);
    return callback(err);
  }

};