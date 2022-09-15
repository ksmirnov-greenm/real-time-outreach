const { ComprehendClient, DetectSentimentCommand } = require("@aws-sdk/client-comprehend");
const Analytics = require('analytics-node');
const analytics = new Analytics('GWAsAPuFHWAz6VQvIOLCvzLhFTXfisww', { flushAt: 20 }); //TODO: set key from config
analytics.flushed = true;

/**
 * track segment events
 * event
 *  -event
 *  -runId: for event 'sms_has_been_sent'
 *  -question: for event 'survey_question_answered'
 *  -anwser: for event 'survey_question_answered'
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
    console.log(event);
    const client = context.getTwilioClient();

    //event names for segment
    const events = {
      sms_has_been_sent: 'Survey sms outreach has been sent',
      survey_question_answered: 'Survey answer',
      survey_completed: 'Survey completed',
    }
    if (event.runId) {

      //TODO: move this to private to share with patient-survey function
      const listDocuments = await fetchSyncDocuments(context, TWILIO_SYNC_SID);
      const patientSurveyDocument = listDocuments.find(d => d.uniqueName === 'PatientsSurveys'); //todo: replace
      const run = patientSurveyDocument.data.queue.find(d => d.runId === event.runId);

      if (run) {
        switch (event.event) {
          case 'sms_has_been_sent': {
            analytics.track({
              userId: run.patientId,
              event: events[event.event],
              properties: {
                surveyId: run.surveyId,
                outreachMethod: 'sms'
              }
            });
            break;
          }
          case 'survey_question_answered': {
            //get sentiments
            //TODO: needs targeted sentiments which is Async, needs s3 bucket and way to pull created results
            // const awsClient = new ComprehendClient({ region: "us-east-1" });
            // var params = {
            //   LanguageCode: 'en',
            //   Text: 'my experience is so positive, i am happy be here with my friends, they are so good and polite!' /* required */
            // };
            // const command = new DetectSentimentCommand(params);
            // const response = await awsClient.send(command);
            // console.log(response);


            analytics.track({
              userId: run.patientId,
              event: events[event.event],
              properties: {
                surveyId: event.surveyId,
                question: event.question,
                answer: event.answer,
                outreachMethod: 'sms'
              }
            });
            break;
          }
          case 'survey_completed': {
            analytics.track({
              userId: run.patientId,
              event: events[event.event],
              properties: {
                surveyId: run.surveyId,
                outreachMethod: 'sms'
              }
            });
            break;
          }
          default: {
            response.setBody({ message: 'Can not find event' });
            response.setStatusCode(404);
            return callback(null, response);
          }
        }

      }
    }

    await analytics.flush(function (err, batch) {
      console.log('Flushed, and now this program can exit!');
    });

    response.setBody({});
    response.setStatusCode(200);
    return callback(null, response);

  } catch (err) {
    console.log(THIS, err);
    return callback(err);
  }

};