const Analytics = require('analytics-node');
const analytics = new Analytics('GWAsAPuFHWAz6VQvIOLCvzLhFTXfisww', { flushAt: 20 }); //TODO: set key from config
analytics.flushed = true;

/**
 * track segment events /to test it locally use postman
 */

exports.handler = async function (context, event, callback) {
  const THIS = 'FUNCTION: /segment-track';

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
    //names come as a event.event
    const events = {
      sms_has_been_sent: 'Survey sms outreach has been sent',
    }

    console.log(event);
    if (event.runId) {

      //TODO: move this to private to share with patient-survey function
      const listDocuments = await fetchSyncDocuments(context, TWILIO_SYNC_SID);
      const patientSurveyDocument = listDocuments.find(d => d.uniqueName === 'PatientsSurveys'); //todo: replace
      const run = patientSurveyDocument.data.queue.find(d => d.runId === event.runId);
      console.log(run);
      if (run) {

        analytics.track({
          userId: run.patientId,
          event: events[event.event],
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