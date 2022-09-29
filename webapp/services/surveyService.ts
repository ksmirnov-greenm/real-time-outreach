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

async function  getPatientSurveyByRunId(runId: any): Promise<any> {
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
  const survey = surveys.find(survey => survey.data.survey.id == run.surveyId).data.survey; 
  return Promise.resolve({survey, patientId: run.patientId});
}




async function triggerSmsWebStudioFlow(data: any): Promise<Array<any>> {
  const result = await fetch(Uris.backendRoot + '/patient-survey', {
    method: 'POST',
    body: JSON.stringify({ action: 'TRIGGER_SMS_WEB', data }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }).then((r) => r.json());

  return Promise.resolve(result);
}


async function triggerIvrStudioFlow(data: any, survey: any): Promise<Array<any>> {
  const result = await fetch(Uris.backendRoot + '/patient-survey', {
    method: 'POST',
    body: JSON.stringify({ action: 'TRIGGER_IVR', data, survey }),
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
  //TODO: handle this error in index and stop loop
  //{status: 400, code: 35114, moreInfo: 'https://www.twilio.com/docs/errors/35114'}
  console.log(result);
  return Promise.resolve(result);
}

export default {
  setSurveyPatientListQueue,
  triggerSmsWebStudioFlow,
  triggerIvrStudioFlow,
  getPatientSurveyByRunId,
  scheduleMessage
};
