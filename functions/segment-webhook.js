
exports.handler = async function (context, event, callback) {
  const THIS = 'FUNCTION: /segment-webhook';

  const { getParam } = require(Runtime.getFunctions()['helpers'].path);
  const { addList, addListItem } = require(Runtime.getFunctions()['datastore/datastore-helpers'].path);
  const TWILIO_SYNC_SID = await getParam(context, 'TWILIO_SYNC_SID');

  const response = new Twilio.Response();
  response.appendHeader('Content-Type', 'application/json');
  if (context.DOMAIN_NAME.startsWith('localhost:')) {
    response.appendHeader('Access-Control-Allow-Origin', '*');
    response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
    response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  switch (event.type) {
    case 'identify':
      await addList(context, TWILIO_SYNC_SID, event.userId);
      break;
    case 'track':
      const model = { event: event.event, properties: event.properties };
      await addListItem(context, TWILIO_SYNC_SID, event.userId, model);
      break;
    default:
      console.log('default');
      break;
  }

  response.setStatusCode(200);
  return callback(null, response);
};

