/*
 * ----------------------------------------------------------------------------------------------------
 * helper functions for studio flow
 * ----------------------------------------------------------------------------------------------------
 */

async function triggerSMSWebFlow(client, context, run) {
  const { getParam } = require(Runtime.getFunctions()['helpers'].path);
  const TWILIO_SMS_WEB_STUDIO_FLOW = await getParam(context, 'TWILIO_SMS_WEB_STUDIO_FLOW');
  const TWILIO_FROM_PHONE_NUMBER = await getParam(context, 'TWILIO_FROM_PHONE_NUMBER');

  const ret = await client.studio.flows(TWILIO_SMS_WEB_STUDIO_FLOW)
    .executions
    .create({
      to: run.patientPhone,
      from: TWILIO_FROM_PHONE_NUMBER,
      parameters: {
        surveyLink: 'https://' + context.DOMAIN_NAME + '/survey.html?runId=' + run.runId,
        runId: run.runId //needs to add event to segment after sms
      }
    });
  return ret;

}



async function triggerIVRFlow(client, context, run, survey) {
  const { getParam } = require(Runtime.getFunctions()['helpers'].path);
  const TWILIO_IVR_STUDIO_FLOW = await getParam(context, 'TWILIO_IVR_STUDIO_FLOW');
  const TWILIO_FROM_PHONE_NUMBER = await getParam(context, 'TWILIO_FROM_PHONE_NUMBER');

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
  return ret;
}

// --------------------------------------------------------------------------------
module.exports = {
  triggerSMSWebFlow,
  triggerIVRFlow,
};
