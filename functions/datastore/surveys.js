const SURVEY_RESOURCE = 'Surveys';
const assert = require("assert");

exports.handler = async function (context, event, callback) {
  const THIS = 'FUNCTION: /datastore/surveys';

  const { getParam } = require(Runtime.getFunctions()['helpers'].path);
  const { fetchSyncDocuments, upsertSyncDocument, read_fhir, save_fhir } = require(Runtime.getFunctions()['datastore/datastore-helpers'].path);
  const TWILIO_SYNC_SID = await getParam(context, 'TWILIO_SYNC_SID');

  try {
    const response = new Twilio.Response();
    response.appendHeader('Content-Type', 'application/json');

    if (context.DOMAIN_NAME.startsWith('localhost:')) {
      response.appendHeader('Access-Control-Allow-Origin', '*');
      response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
      response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
    }

    const action = event.action ? event.action : null;
    const survey = event.survey ? event.survey : null;

    switch (action) {
      case 'ADD': {
        const surveyDocument = { fileName: event.fileName, survey: event.survey };
        const result = await upsertSyncDocument(context, TWILIO_SYNC_SID, SURVEY_RESOURCE + '_' + event.fileName.toLowerCase().replace(/[^a-zA-Z0-9]+/g, "-") + '_' + Date.now(), surveyDocument);
        response.setBody(result);
        response.setStatusCode(200);
        return callback(null, response);
      }
      case 'GET': {
        const listDocuments = await fetchSyncDocuments(context, TWILIO_SYNC_SID);
        const surveyListDocuments = listDocuments.filter(d => d.uniqueName.startsWith(SURVEY_RESOURCE));
        response.setBody(surveyListDocuments);
        response.setStatusCode(200);
        return callback(null, response);
      }
      case 'REMOVE': {
        const res = await deleteSyncDocumentBySid(context, TWILIO_SYNC_SID, event.surveySid);
        response.setStatusCode(200);
        response.setBody({ res });
        return callback(null, response);
      }
      default: {
        response.setBody({ message: 'Neither a ADD or GET action' });
        response.setStatusCode(401);
        return callback(null, response);
      }
    }
  } catch (err) {
    console.log(THIS, err);
    return callback(err);
  }

};