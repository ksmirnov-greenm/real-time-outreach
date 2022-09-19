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


        //TODO: set flow sid from config
        await client.studio.flows('FW44f916fbad1b19add294a89253d22e51')
          .executions
          .create({
            to: '+15673234956',
            from: '+17087667625', //todo: set phone from config
            parameters: {
              runId: '',
              survey: {
                "resourceType" : "Questionnaire",
                "id" : "3141",
                "title" : "Basic Questionnaire",
                "status" : "draft",
                "experimental" : true,
                "subjectType" : ["Patient"],
                "item" : [{
                  "linkId" : "1",
                  "text" : "Do you have allergies?",
                  "type" : "boolean"
                },
                {
                  "linkId" : "2",
                  "text" : "Leave feedback",
                  "type" : "text"
                }
                ]
              }
            }
          });
    


    response.setBody({});
    response.setStatusCode(200);
    return callback(null, response);

  } catch (err) {
    console.log(THIS, err);
    return callback(err);
  }

};