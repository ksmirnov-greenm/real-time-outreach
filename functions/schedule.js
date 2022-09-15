const Analytics = require('analytics-node');
const analytics = new Analytics('GWAsAPuFHWAz6VQvIOLCvzLhFTXfisww', { flushAt: 20 }); //TODO: set key from config
analytics.flushed = true;

/**
 * hook for scheduled message /to test it locally use postman
 */

exports.handler = async function (context, event, callback) {
  const THIS = 'FUNCTION: /schedule';

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

    const client = context.getTwilioClient();
    
    const body = event.Body ? JSON.parse(event.Body) : {};
    if (body.runId) {

      //TODO: move this to private to share with patient-survey function
      const listDocuments = await fetchSyncDocuments(context, TWILIO_SYNC_SID);
      const patientSurveyDocument = listDocuments.find(d => d.uniqueName === 'PatientsSurveys'); //todo: replace
      const run = patientSurveyDocument.data.queue.find(d => d.runId === body.runId);
      if (run) {
        //TODO: set flow sid from config
        await client.studio.flows('FWf5164031e7b7727c75c12b24b90c0c5b')
          .executions
          .create({
            to: run.patientPhone,
            from: '+17087667625', //todo: set phone from config
            parameters: {
              //TODO: use url from config
              surveyLink: 'https://' + context.DOMAIN_NAME + '/survey.html?runId=' + run.runId,
              runId: run.runId //needs to add event to segment after sms
            }
          });


        analytics.track({
          userId: run.patientId,
          event: 'Survey sms outreach attempt',
          properties: {
            surveyId: run.surveyId,
            outreachMethod: 'sms'
          }
        });

        await analytics.flush(function (err, batch) {
          console.log('Flushed, and now this program can exit!');
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