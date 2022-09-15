import { Uris } from "./constants";
import datastoreService from "./datastoreService";


/*
 *
 */
async function setSurveyPatientListQueue(data: any): Promise<Array<any>> {
  const result = await fetch(Uris.backendRoot + '/patient-survey', {
    method: 'POST',
    body: JSON.stringify({ action: 'CREATE', data }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }).then((r) => r.json());

  return Promise.resolve(result);
}

async function getPatientSurveyByRunId(runId: any): Promise<any> {
  const patientSurveys = await fetch(Uris.backendRoot + '/patient-survey', {
    method: 'POST',
    body: JSON.stringify({ action: 'GET', runId }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }).then((r) => r.json());
  console.log(patientSurveys);
  const run = patientSurveys.data.queue.find(q =>  runId === q.runId );
  const patientsList = await datastoreService.fetchPatientLists();
  const surveys = await datastoreService.getSurveys();
  const survey = surveys.find(survey => survey.data.survey.id = run.surveyId).data.survey; 
  return Promise.resolve({survey, patientId: run.patientId});
}




async function triggerStudioFlow(data: any): Promise<Array<any>> {
  const result = await fetch(Uris.backendRoot + '/patient-survey', {
    method: 'POST',
    body: JSON.stringify({ action: 'TRIGGER', data }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }).then((r) => r.json());

  return Promise.resolve(result);
}



async function scheduleMessage(data: any, scheduleDate: any): Promise<Array<any>> {
  const result = await fetch(Uris.backendRoot + '/patient-survey', {
    method: 'POST',
    body: JSON.stringify({ action: 'SCHEDULE', data, scheduleDate }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }).then((r) => r.json());

  return Promise.resolve(result);
}

export default {
  setSurveyPatientListQueue,
  triggerStudioFlow,
  getPatientSurveyByRunId,
  scheduleMessage
};
