/**
 * hook for scheduled message /to test it locally use postman
 * 
 */

exports.handler = async function (context, event, callback) {
  const THIS = 'FUNCTION: /schedule';

  const { getParam } = require(Runtime.getFunctions()['helpers'].path);
  const { fetchSyncDocuments, upsertSyncDocument } = require(Runtime.getFunctions()['datastore/datastore-helpers'].path);
  const { triggerSMSWebFlow, triggerSMSFlow, triggerIVRFlow } = require(Runtime.getFunctions()['studio-flow'].path);
  const TWILIO_SYNC_SID = await getParam(context, 'TWILIO_SYNC_SID');

  try {
    const response = new Twilio.Response();
    response.appendHeader('Content-Type', 'application/json');
    if (context.DOMAIN_NAME.startsWith('localhost:')) {
      response.appendHeader('Access-Control-Allow-Origin', '*');
      response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
      response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
    }

    const client = context.getTwilioClient();
    
    const body = event.Body ? JSON.parse(event.Body) : {};
    if (body.runId) {
      const listDocuments = await fetchSyncDocuments(context, TWILIO_SYNC_SID);
      const patientSurveyDocument = listDocuments.find(d => d.uniqueName === 'PatientsSurveys'); //todo: replace
      const run = patientSurveyDocument.data.queue.find(d => d.runId === body.runId);
      if (run) {
        switch(run.outreachMethod) {
          case 'sms-web':{
            await triggerSMSWebFlow(client, context, run);
          }
          case 'ivr': {
            const survey = listDocuments.find(d => d.sid === run.surveySid).data.survey;
            await triggerIVRFlow(client, context, run, survey);
          }
          case 'sms': {
            const survey = listDocuments.find(d => d.sid === run.surveySid).data.survey;
            await triggerSMSFlow(client, context, run, survey);
          }
        } 
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