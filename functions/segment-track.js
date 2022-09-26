const { ComprehendClient, DetectSentimentCommand } = require("@aws-sdk/client-comprehend");
const Analytics = require('analytics-node');
const analytics = new Analytics('GWAsAPuFHWAz6VQvIOLCvzLhFTXfisww', { flushAt: 20 }); //TODO: set key from config
analytics.flushed = true;

/**
 * track segment events
 * event
 *  -event
 *  -runId:
 *  -outreachMethod: 'sms','ivr' default 'sms'  
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
      survey_page_opened: 'Survey sms webpage has been opened',
      sms_has_been_sent: 'Survey sms outreach has been sent',
      ivr_has_been_started: 'Survey ivr outreach has been started',
      survey_question_answered: 'Survey answer',
      survey_completed: 'Survey completed',
    }

    const outreachMethod = event.outreachMethod ? event.outreachMethod : 'sms';

    if (event.runId) {
      //TODO: move this to private to share with patient-survey function
      const listDocuments = await fetchSyncDocuments(context, TWILIO_SYNC_SID);
      const patientSurveyDocument = listDocuments.find(d => d.uniqueName === 'PatientsSurveys'); //todo: replace
      const run = patientSurveyDocument.data.queue.find(d => d.runId === event.runId);

      if (!run) {
        response.setBody({ message: 'Can not find run for this runId' });
        response.setStatusCode(404);
        return callback(null, response);
      }


      const survey = listDocuments.find(d => d.sid === run.surveySid).data.survey;

      if (run) {
        switch (event.event) {
          case 'survey_page_opened':
          case 'sms_has_been_sent':
          case 'survey_completed':
          case 'ivr_has_been_started': {
            console.log(event, run);
            analytics.track({
              userId: run.patientId,
              event: events[event.event],
              properties: {
                surveyId: survey.id,
                outreachMethod: outreachMethod
              }
            });
            break;
          }
          case 'survey_question_answered': {
            let sentiment = null;
            let answer = event.answer;
            const question = survey.item.find(q => q.linkId === event.questionId);

            if (question.type == 'text') {

              if (outreachMethod == 'ivr') {
                //TranscriptionText  from studio flow recordVoiceMail widget
                answer = event.TranscriptionText;
              }

              //get sentiments
              //TODO: needs targeted sentiments which is Async, needs s3 bucket and way to pull created results
              const awsClient = new ComprehendClient({ region: "us-east-1" });
              var params = {
                LanguageCode: 'en',
                Text: answer
              };
              const command = new DetectSentimentCommand(params);
              const response = await awsClient.send(command);
              sentiment = response.Sentiment;
            }
            if (question.type == 'boolean' && outreachMethod == 'ivr') {
              //ivr press buttons mapping here
              if (answer == 1) {
                answer = true;
              }
              if (answer == 2) {
                answer = false;
              }
            }

            analytics.track({
              userId: run.patientId,
              event: events[event.event],
              properties: {
                surveyId: survey.id,
                question: question,
                answer: answer,
                sentiment: sentiment,
                outreachMethod: outreachMethod
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