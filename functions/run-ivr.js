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
              runId: '2a5c81a1-33ff-4743-b295-6748a14ed420',
              survey: {
                "resourceType" : "Questionnaire",
                "id" : "demo_survey_1",
                "title" : "Satisfaction Survey",
                "status" : "draft",
                "experimental" : true,
                "subjectType" : ["Patient"],
                "item" : [{
                  "linkId" : "1",
                  "text" : "The provider listened carefully to me",
                  "type" : "boolean"
                },
                {
                  "linkId" : "2",
                  "text" : "The provider knew important information about my medical history",
                  "type" : "boolean"
                },  
                {
                  "linkId" : "3",
                  "text" : "The provider explained things in a way that was easy to understand",
                  "type" : "boolean"
                },  
                {
                  "linkId" : "4",
                  "text" : "The provider answered all my questions to my satisfaction",
                  "type" : "boolean"
                },  
                {
                  "linkId" : "5",
                  "text" : "Please describe any other information about your experience you want to share with us",
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