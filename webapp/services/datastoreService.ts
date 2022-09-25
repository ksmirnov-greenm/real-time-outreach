/* --------------------------------------------------------------------------------------------------------------
 * encapsulation of server datastore functions
 * --------------------------------------------------------------------------------------------------------------
 */
//import { EHRPatient, PostVisitSurvey } from "../types";
import { Uris } from "./constants";
const assert = require('assert');

/* --------------------------------------------------------------------------------------------------------------
 * fetch PatientLists from server datastore
 *
 * --------------------------------------------------------------------------------------------------------------
 */
async function fetchPatientLists(): Promise<Array<any>> {
  const result = await fetch(Uris.backendRoot + '/datastore/patients', {
    method: 'POST',
    body: JSON.stringify({ action: 'GET' }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }).then((r) => r.json());

  return Promise.resolve(result);
}

/* --------------------------------------------------------------------------------------------------------------
 * fetch PatientLists from server datastore
 *
 * --------------------------------------------------------------------------------------------------------------
 */
async function fetchDashboardData(): Promise<Array<any>> {
  return await fetch(Uris.backendRoot + '/datastore/dashboard', {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }).then((r) => r.json());
}

/* --------------------------------------------------------------------------------------------------------------
 * create new patient list
 * --------------------------------------------------------------------------------------------------------------
 */
async function addPatientList(patientList: any[], fileName: string): Promise<any> {
  
  const result = await fetch(Uris.backendRoot + '/datastore/patients', {
    method: 'POST',
    body: JSON.stringify({ fileName, patientList, action: 'ADD' }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }).then(async (r) => await r.json());

  if (! result) {
    Promise.reject({ error: 'Unable to create new patient list!!!' });
  }

  return Promise.resolve(result);
}



async function removePatientList(patientListId: string) {
  const appointmentResp = await fetch(Uris.backendRoot + '/datastore/patients', {
    method: 'POST',
    body: JSON.stringify({ action: 'REMOVE', patientListId: patientListId }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }).then(r => r.json());

  if (!appointmentResp) {
    Promise.reject({ error: "Failed to remove appointment or did not find appointment!"});
  }

  return Promise.resolve(appointmentResp);
}


/* --------------------------------------------------------------------------------------------------------------
 * add new survey
 * --------------------------------------------------------------------------------------------------------------
 */
async function addSurvey(survey: any, fileName: string): Promise<any[]> {
  
  const surveyResponse = fetch(Uris.backendRoot + '/datastore/surveys', {
    method: 'POST',
    body: JSON.stringify({ action: 'ADD', survey, fileName }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }).then(res => res.json());

  if (!surveyResponse) {
    Promise.reject({ error: "Unable to add post visit survey!"});
  }

  return Promise.resolve(surveyResponse);
}


/* --------------------------------------------------------------------------------------------------------------
 * get surveys
 * --------------------------------------------------------------------------------------------------------------
 */

async function getSurveys(): Promise<any[]> {
  
  const surveys = fetch(Uris.backendRoot + '/datastore/surveys', {
    method: 'POST',
    body: JSON.stringify({ action: 'GET' }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }).then(res => res.json());

  if (!surveys) {
    Promise.reject({ error: "Unable to get survey!"});
  }

  return Promise.resolve(surveys);
}

export default {
  fetchPatientLists,
  fetchDashboardData,
  addPatientList,
  removePatientList,
  addSurvey,
  getSurveys,
};
