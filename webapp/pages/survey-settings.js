import Layout from "../components/layout/layout";
import { useEffect, useState } from "react";
import StepForm from "../components/step-form/step-form";
import helperService from "../services/helperService";
import datastoreService from "../services/datastoreService";
import surveyService from "../services/surveyService";
import ProgressOverlay from "../components/progress-overlay/progress-overlay";

export default function Index() {

	const [processing, setProcessing] = useState(false);

	const [patientListCollection, setPatientListCollection] = useState([]);
	const [selectedPatientListSid, setSelectedPatientListSid] = useState('');
	const [surveyCollection, setSurveyCollection] = useState([]);
	const [selectedSurveySid, setSelectedSurveySid] = useState('');
	const [launchIsScheduled, setLaunchIsScheduled] = useState(false);
	const [outreachMethod, setOutreachMethod] = useState('sms-web'); //sms-web,ivr,sms
	//TODO: create time picker
	//for now it is +16min, due to twilio limits 15min-7days, Date.now() + (17 * 60 * 1000)
	//TODO: ideally add limitation in pickers
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [timeValue, setTimeValue] = useState(('0' + (new Date()).getHours()).slice(-2) + ':' + ('0' + (new Date()).getMinutes()).slice(-2));
	const [requestCount, setRequestCount] = useState(0);
	const [currentRequest, setCurrentRequest] = useState(0);

	const selectCurrentList = (sid) => {
		if (selectedPatientListSid === sid) {
			setSelectedPatientListSid('');
			setSelectedSurveySid('');
		} else {
			setSelectedPatientListSid(sid);
			console.log(selectedSurveySid);
		}
	}

	const selectCurrentSurvey = (sid) => {
		if (selectedSurveySid === sid) {
			setSelectedSurveySid('');
		} else {
			setSelectedSurveySid(sid);
		}
	}

	const uploadPatientList = (e) => {
		const file = Array.from(e.target.files);
		let fileExtension = file[0] ?.name ?.split('.') ?.pop();
		const reader = new FileReader();
		reader.readAsText(file[0]);
		reader.onload = async (event) => {

			const jsonObj = (() => {
				switch (fileExtension) {
					case 'csv': return helperService.csv2json(event.target.result);
					//fhir patients format
					case 'json': return helperService.text2json(event.target.result);
					default: return {};
				}
			})();

			const patientDocument = await datastoreService.addPatientList(jsonObj, file[0].name);

			if (patientListCollection.length === 0) {
				setSelectedPatientListSid(patientDocument.sid);
			}
			setPatientListCollection([...patientListCollection, patientDocument]);
		};
		reader.onerror = function () {
			alert('Unable to read ' + file.name);
		}
	}

	const uploadSurvey = (e) => {
		const file = Array.from(e.target.files);
		console.log(file);
		const reader = new FileReader();
		reader.readAsText(file[0]);
		reader.onload = async (event) => {
			const survey = JSON.parse(event.target.result);
			const surveyDocument = await datastoreService.addSurvey(survey, file[0].name);

			if (surveyCollection.length === 0) {
				setSelectedSurveySid(surveyDocument.sid);
			}
			setSurveyCollection([...surveyCollection, surveyDocument]);
		};
		reader.onerror = function () {
			alert('Unable to read ' + file.name);
		}
	}

	const submit = async () => {
		const [hours, minutes] = timeValue.split(':');

		const data = {
			patientListSid: selectedPatientListSid,
			surveySid: selectedSurveySid,
			outreachMethod: outreachMethod,
			scheduleDate: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), hours, minutes)
		}

		//TODO: refactor to nice error message
		if (launchIsScheduled) {
			if (((data.scheduleDate - (new Date())) / 1000) < 900 || ((data.scheduleDate - (new Date())) / 1000) > 604800) {
				alert('Time must be between 15 minutes and 7 days in the future, inclusive!');
				return;
			}
		}

		setProcessing(true);

		//1. save queue to storage
		const queue = await surveyService.setSurveyPatientListQueue(data);
		setRequestCount(queue.length);
		//limit of twilio function is 10 sec, so we have to trigger studio flows here
		//2. if runs are not scheduled - trigger it
		const patientListDocument = patientListCollection.find(d => d.sid === selectedPatientListSid);
		const surveyDocument = surveyCollection.find(d => d.sid === selectedSurveySid);

		//async requests
		await runRequests(queue, patientListDocument, data, surveyDocument.data.survey, 0);

		setProcessing(false);
		setCurrentRequest(0);
		setRequestCount(0);
		console.log('submit data: ', data);
	}

	const removePatientList = async (sid) => {
		const patientDocument = await datastoreService.removePatientList(sid);
		setPatientListCollection(patientListCollection.filter(l => l.sid !== sid));
	}

	const removeSurvey = async (sid) => {
		const patientDocument = await datastoreService.removePatientList(sid);
		setSurveyCollection(surveyCollection.filter(l => l.sid !== sid));
	}

	const runRequests = async (queue, patientListDocument, data, survey, index) => {
		const run = queue[index];
		const nextRequestIndex = index + 1;
		const res = await request(run, patientListDocument, data, survey);
		console.log(res);
		if (queue.length > nextRequestIndex) {
			setCurrentRequest(nextRequestIndex);
			return await runRequests(queue, patientListDocument, data, survey, nextRequestIndex);
		}
	}

	const request = async (run, patientListDocument, data, survey) => {
		// const patient = patientListDocument.data.patientList.find(d => d.patientId === run.patientId);
		if (launchIsScheduled) {
			return await surveyService.scheduleMessage(run, data.scheduleDate);
		} else {
			switch (run.outreachMethod) {
				case 'sms-web': return await surveyService.triggerSmsWebStudioFlow(run);
				case 'sms': return await surveyService.triggerSmsStudioFlow(run, survey);
				case 'ivr': return await surveyService.triggerIvrStudioFlow(run, survey);
			}
		}
	}

	useEffect(() => {
		datastoreService.fetchPatientLists()
			.then(res => {
				console.log(res);
				setPatientListCollection(res);
			});
		datastoreService.getSurveys()
			.then(res => {
				console.log(res);
				if (res.length === 1) {
					setSelectedSurveySid(res[0].sid);
				}
				setSurveyCollection(res);
			});

	}, [])

	return <>
		{processing && <ProgressOverlay
			requestCount={requestCount}
			current={currentRequest}
		/>}
		<StepForm
			patientListCollection={patientListCollection}
			selectedPatientListSid={selectedPatientListSid}
			surveyCollection={surveyCollection}
			selectedSurveySid={selectedSurveySid}
			selectCurrentList={selectCurrentList}
			selectCurrentSurvey={selectCurrentSurvey}
			uploadPatientList={uploadPatientList}
			uploadSurvey={uploadSurvey}
			submit={submit}
			selectedDate={selectedDate}
			setSelectedDate={setSelectedDate}
			launchIsScheduled={launchIsScheduled}
			setLaunchIsScheduled={setLaunchIsScheduled}
			timeValue={timeValue}
			setTimeValue={setTimeValue}
			removePatientList={removePatientList}
			removeSurvey={removeSurvey}
			outreachMethod={outreachMethod}
			selectOutreach={setOutreachMethod}
		/>
	</>
}

Index.getLayout = function getLayout(page) {
	return (
		<Layout>
			{page}
		</Layout>
	)
}
