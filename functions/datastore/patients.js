/*
 * --------------------------------------------------------------------------------
 * manage patients including storage to EHR
 *
 * event parameters:
 * .action: GET|ADD
 * --------------------------------------------------------------------------------
 */

const FHIR_PATIENT = 'Patients';
const PATIENT_SYNC_DOCUMENT = 'Patients';

const assert = require("assert");
const { getParam } = require(Runtime.getFunctions()['helpers'].path);
const {fetchSyncDocuments, upsertSyncDocument, read_fhir, save_fhir } = require(Runtime.getFunctions()['datastore/datastore-helpers'].path);

// --------------------------------------------------------------------------------
function transform_fhir_to_patient(fhir_patient, fhir_medication_statements, fhir_conditions) {
  const r = fhir_patient;

  const pid = 'Patient/' + r.id;
  const patient = {
    patientId: r.id,
    patientFirstName: r.name[0].text,
    ...(r.name[0].family && { patient_family_name: r.name[0].family }),
    patientLastname: r.name[0].given[0],
    patientPhone: r.telecom[0].value,
    patientGender: r.gender.charAt(0).toUpperCase() + r.gender.slice(1),
    patientLanguage: r.communication[0].language.text,
  };

  return patient;
}


// --------------------------------------------------------------------------------
exports.handler = async function(context, event, callback) {
  const THIS = 'patients:';
  console.time(THIS);


  try {
    const TWILIO_SYNC_SID = await getParam(context, 'TWILIO_SYNC_SID');

    const response = new Twilio.Response();
    response.appendHeader('Content-Type', 'application/json');
    
    if (context.DOMAIN_NAME.startsWith('localhost:')) {
      response.appendHeader('Access-Control-Allow-Origin', '*');
      response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
      response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
    }

    switch (event.action) {
      case 'GET': {
        const listDocuments = await fetchSyncDocuments(context, TWILIO_SYNC_SID);        
        const patientListDocuments =  listDocuments.filter(d => d.uniqueName.startsWith(PATIENT_SYNC_DOCUMENT + '_') );
        response.setStatusCode(200);
        response.setBody(patientListDocuments);
        return callback(null, response);
      }

      case 'ADD': {
        const patientDocument = {fileName: event.fileName, patientList: event.patientList};
        const patientListDocument = await upsertSyncDocument(context, TWILIO_SYNC_SID, PATIENT_SYNC_DOCUMENT + '_' +  event.fileName.toLowerCase().replace(/[^a-zA-Z0-9]+/g, "-") + '_' + Date.now() , patientDocument);        
        response.setStatusCode(200);
        response.setBody(patientListDocument);
        return callback(null, response);
      }

      case 'REMOVE': {
        //TODO: remove
        response.setStatusCode(200);
        response.setBody({ patientListSid : event.patientListSid });
        return callback(null, response);
      }

      default: // unknown action
        throw Error(`Unknown action: ${action}!!!`);
    }

  } catch (err) {
    console.log(THIS, err);
    return callback(err);
  } finally {
    console.timeEnd(THIS);
  }
};
