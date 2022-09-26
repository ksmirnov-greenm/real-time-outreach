/*
 * ----------------------------------------------------------------------------------------------------
 * helper functions for studio flow
 * ----------------------------------------------------------------------------------------------------
 */
const Analytics = require('analytics-node');

async function triggerSMSFlow(client, context, run) {
  const { getParam } = require(Runtime.getFunctions()['helpers'].path);
  const TWILIO_SMS_STUDIO_FLOW = await getParam(context, 'TWILIO_SMS_STUDIO_FLOW');
  const TWILIO_FROM_PHONE_NUMBER = await getParam(context, 'TWILIO_FROM_PHONE_NUMBER');
  const SEGMENT_ANALYTICS_KEY = await getParam(context, 'SEGMENT_ANALYTICS_KEY');
  const analytics = new Analytics(SEGMENT_ANALYTICS_KEY, { flushAt: 20 }); //TODO: set key from config
  analytics.flushed = true;


  const ret = await client.studio.flows(TWILIO_SMS_STUDIO_FLOW)
    .executions
    .create({
      to: run.patientPhone,
      from: TWILIO_FROM_PHONE_NUMBER,
      parameters: {
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

  return ret;

}



async function triggerIVRFlow(client, context, run, survey) {
  const { getParam } = require(Runtime.getFunctions()['helpers'].path);
  const TWILIO_IVR_STUDIO_FLOW = await getParam(context, 'TWILIO_IVR_STUDIO_FLOW');
  const TWILIO_FROM_PHONE_NUMBER = await getParam(context, 'TWILIO_FROM_PHONE_NUMBER');
  const SEGMENT_ANALYTICS_KEY = await getParam(context, 'SEGMENT_ANALYTICS_KEY');
  const analytics = new Analytics(SEGMENT_ANALYTICS_KEY, { flushAt: 20 }); //TODO: set key from config
  analytics.flushed = true;

  const ret = await client.studio.flows(TWILIO_IVR_STUDIO_FLOW)
  .executions
  .create({
    to: run.patientPhone,
    from: TWILIO_FROM_PHONE_NUMBER,
    parameters: {
      runId: run.runId,
      //send whole survey to the flow 
      //(possible issue big size), then questions should be requesed in the flow one by one 
      survey: survey 
    }
  });



  analytics.track({
    userId: run.patientId,
    event: 'Survey ivr outreach attempt',
    properties: {
      surveyId: run.surveyId,
      outreachMethod: 'ivr'
    }
  });

  await analytics.flush(function (err, batch) {
    console.log('Flushed, and now this program can exit!');
  });

  return ret;

}

// --------------------------------------------------------------------------------
module.exports = {
  triggerSMSFlow,
  triggerIVRFlow,
};
