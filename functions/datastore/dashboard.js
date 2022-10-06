function getStatus(eventsListItems) {
	if (eventsListItems.find(item => item.data.event === 'Survey completed')) {
		return 'passed';
	}

	if (eventsListItems.find(item => item.data.event === 'Survey answer')) {
		return 'partly passed';
	}

	if (eventsListItems.find(item => item.data.event === 'Web Survey has been opened') ||
		eventsListItems.find(item => item.data.event === 'IVR survey incoming call accepted')) {
		return 'not passed';
	}

	if (eventsListItems.find(item => item.data.event === 'SMS invitation to the Web survey has been sent') ||
		eventsListItems.find(item => item.data.event === 'IVR invitation to the IVR survey has been sent') ||
		eventsListItems.find(item => item.data.event === 'SMS invitation to the SMS survey has been sent')) {
		return 'sent';
	}

	if (eventsListItems.find(item => item.data.event === 'SMS/Web survey outreach scheduled') ||
		eventsListItems.find(item => item.data.event === 'IVR/IVR survey outreach scheduled') ||
		eventsListItems.find(item => item.data.event === 'SMS/SMS survey outreach scheduled')) {
		return 'scheduled';
	}
	//scheduled, sent, not passed, partly passed, passed

	//SMS/Web survey outreach scheduled / IVR/IVR survey outreach scheduled / SMS/SMS survey outreach scheduled
	//SMS invitation to the Web survey has been sent / IVR invitation to the IVR survey has been sent / SMS invitation to the SMS survey has been sent
	//Web Survey has been opened / IVR survey incoming call accepted / -
	//Survey answer
	//Survey completed

}


function getResults(survey, eventsListItems) {
	const ret = [];
	//show results only for these
	if (getStatus(eventsListItems) !== 'passed' && getStatus(eventsListItems) !== 'partly passed') {
		return ret;
	}
	survey.item.map(q => {
		const res = Object.assign({}, q);
		res['answer'] = eventsListItems.find(item => item.data.event === 'Survey answer' && item.data.properties.question.linkId == q.linkId) ?.data ?.properties ?.answer.toString();
		ret.push(res);
	});
	return ret;
}

function getSentiment(survey, eventsListItems) {
	const ret = [];
	//show results only for these
	if (getStatus(eventsListItems) !== 'passed' && getStatus(eventsListItems) !== 'partly passed') {
		return ret;
	}
	survey.item.map(q => {
		const res = Object.assign({}, q);
		res['answer'] = eventsListItems.find(item => item.data.event === 'Survey answer' && item.data.properties.question.linkId == q.linkId) ?.data ?.properties ?.answer.toString();
		ret.push(res);
	});
	return ret;
}



exports.handler = async function (context, event, callback) {
	const THIS = 'FUNCTION: /datastore/dashboard';
	const { getParam } = require(Runtime.getFunctions()['helpers'].path);
	const { fetchSyncDocuments, fetchSyncLists, fetchSyncListItems } = require(Runtime.getFunctions()['datastore/datastore-helpers'].path);
	const TWILIO_SYNC_SID = await getParam(context, 'TWILIO_SYNC_SID');
	const dashboardData = { patients: [] };

	try {
		const response = new Twilio.Response()
		// Set the CORS headers to allow Flex to make an error-free HTTP request
		// to this Function
		response.appendHeader('Content-Type', 'application/json');

		if (context.DOMAIN_NAME.startsWith('localhost:')) {
			response.appendHeader('Access-Control-Allow-Origin', '*');
			response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
			response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
		}

		const documents = await fetchSyncDocuments(context, TWILIO_SYNC_SID);
		const patientSurveyDocument = documents.find(d => d.uniqueName === 'PatientsSurveys'); //todo: replace
		const patientsQueue = patientSurveyDocument.data.queue;

		const patientEventsLists = await fetchSyncLists(context, TWILIO_SYNC_SID);

		await Promise.all(patientsQueue.map(async (run) => {
			const patientEventsList = patientEventsLists.find(list => run.patientId === list.uniqueName);
			const eventsListItems = await fetchSyncListItems(context, TWILIO_SYNC_SID, patientEventsList.sid);
			const patient = documents.find(d => d.sid === run.patientListSid).data.patientList.find(p => p.patientId === run.patientId);
			const survey = documents.find(d => d.sid === run.surveySid).data.survey;

			const patientResults = {
				name: patient.patientFirstName + ' ' + patient.patientLastName,
				status: getStatus(eventsListItems),
				results: getResults(survey, eventsListItems),
				sentiment: (eventsListItems.find(item => item.data.event === 'Survey answer' && item.data.properties.question.type === 'text') ?.data ?.properties ?.sentiment)
			}
			dashboardData.patients.push(patientResults);

		}));

		response.setStatusCode(200);
		response.setBody(dashboardData);
		// Return a success response using the callback function
		return callback(null, response);
	} catch (err) {
		console.log(THIS, err);
		return callback(err);
	}
}
