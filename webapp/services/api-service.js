import { Uris } from "./constants";

export async function getPatientLists() {
	try {
		const url = Uris.backendRoot + '/patient-list';
		console.log('url', url);
		
		return await fetch(url, {
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			}
		}).then((r) => r.json());
	} catch (e) {
		console.log('e', e);
		return []
	}
}

export async function getPatientSurvey(runId) {
	try {
		const url = Uris.backendRoot + '/get-patient-survey';
		return await fetch(url, {
			method: 'POST',
			body: JSON.stringify({ runId }),
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			}
		}).then((r) => r.json());
	} catch (e) {
		console.log('e', e);
		return {
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
		};
	}
}
