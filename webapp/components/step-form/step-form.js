import styles from './step-form.module.css';
import StepNumber from "./step-number";
import { useEffect, useState } from "react";
import StepContainer from "./step-container";
import Button from "../button/button";
import FileUploader from "../file-uploader/file-uploader";
import { getPatientLists } from "../../services/api-service";
import datastoreService from "../../services/datastoreService";
import surveyService from "../../services/surveyService";
import helperService from "../../services/helperService";

import { v4 as uuidV4 } from 'uuid';
import DatePicker from "react-datepicker";
/*import 'react-clock/dist/Clock.css';
import 'react-time-picker/dist/TimePicker.css';*/
import TimePicker from 'react-time-picker/dist/entry.nostyle';

const StepForm = () => {

	const [currentStep, setCurrentStep] = useState(1);
	const [patientListCollection, setPatientListCollection] = useState([]);
	const [selectedPatientListSid, setSelectedPatientListSid] = useState('');
	const [surveyCollection, setSurveyCollection] = useState([]);
	const [selectedSurveySid, setSelectedSurveySid] = useState('');
	// const [timeValue, setTimeValue] = useState(new Date());
	const [selectedDate, setSelectedDate] = useState(new Date());

	const selectCurrentList = (sid) => {
		if (selectedPatientListSid === sid) {
			setSelectedPatientListSid('');
		} else {
			setSelectedPatientListSid(sid);
			console.log(selectedSurveySid);
			if (selectedSurveySid) {
				setCurrentStep(3);
			}
		}
	}

	const selectCurrentSurvey = (sid) => {
		if (selectedSurveySid === sid) {
			setSelectedSurveySid('');
		} else {
			setSelectedSurveySid(sid);
			setCurrentStep(3);
		}
	}

	const submit = async () => {
		const data = {
			patientListSid: selectedPatientListSid,
			surveySid: selectedSurveySid,
			scheduleDate: selectedDate
		}

		//1. save queue to storage
		const queue = await surveyService.setSurveyPatientListQueue(data);
		//limit of twilio function is 10 sec, so we have to trigger studio flows here
		//2. if runs are not scheduled - trigger it
		const patientListDocument = patientListCollection.find(d => d.sid === selectedPatientListSid);
		const surveyDocument = surveyCollection.find(d => d.sid === selectedSurveySid);
		console.log(patientListCollection);
		console.log(selectedPatientListSid);
		//async requests
		const responses = await Promise.all(
			queue.map(async run => {
				const patient = patientListDocument.data.patientList.find(d => d.patientId === run.patientId);
				await surveyService.triggerStudioFlow({runId: run.runId, patient, survey: surveyDocument.data.survey});
			})
		);

		console.log('submit data: ', data);

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

	useEffect(() => {
		if (selectedPatientListSid) {
			if (selectedSurveySid) {
				setCurrentStep(3);
			} else {
				setCurrentStep(2);
			}
		} else {
			setCurrentStep(1);
		}
	}, [selectedPatientListSid, selectedSurveySid]);


	const uploadPatientList = (e) => {
		const file = Array.from(e.target.files);
		const reader = new FileReader();
		reader.readAsText(file[0]);
		reader.onload = async (event) => {
			const csv = event.target.result;
			const data = csv.split(/\r?\n/);
			const n = data.filter(r => r.length > 0).length - 1; // # of lines excluding empty line & header
			const jsonText = helperService.csv2json(csv);
			const jsonObj = JSON.parse(jsonText);

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

	return <div className={styles.container}>
		<StepContainer
			step={1}
			currentStep={currentStep}
			title="Choose patient list"
			note="Use .scv format or FHIR Patient resource, up to 5 MB"
		>

			<FileUploader
				change={uploadPatientList}
				name={"user-list"}
				disabled={false}
			>
				Upload User List
			</FileUploader>

			{(patientListCollection.length > 1) && <p className={styles.listtitle}>Choose patient list</p>}

			{patientListCollection.map(patientList =>

				<div key={patientList.sid} className={styles.filename}>
					<input
						type="checkbox"
						value={patientList.sid}
						onChange={() => selectCurrentList(patientList.sid)}
						checked={patientList.sid === selectedPatientListSid}
						disabled={patientListCollection.length === 0}
					/>
					{patientList.data.fileName}
				</div>
			)}
		</StepContainer>

		<StepContainer
			step={2}
			currentStep={currentStep}
			title="Choose Survey"
			note="Use FHIR’s Questionnaire resource format"
		>

			<FileUploader
				change={uploadSurvey}
				name={"survey"}
				disabled={currentStep < 2}
			>
				Upload Survey
			</FileUploader>

			{(surveyCollection.length > 1) && <p className={styles.listtitle}>Choose survey</p>}

			{surveyCollection.map(survey =>
				<div key={survey.sid} className={styles.filename}>
					<input
						type="checkbox"
						value={survey.sid}
						onChange={() => selectCurrentSurvey(survey.sid)}
						checked={survey.sid === selectedSurveySid || surveyCollection.length === 1}
						disabled={surveyCollection.length === 1}
					/>
					{survey.data.fileName}
				</div>
			)}

		</StepContainer>

		<StepContainer
			step={3}
			currentStep={currentStep}
			title="Select dates"
			note="Select date and time we should send surveys"
		>
			<div className={styles.timecontainer}>
				<DatePicker
					selected={selectedDate}
					onChange={(date) => setSelectedDate(date)}
					disabled={currentStep < 3}
				/>

				{/*<TimePicker
					onChange={setTimeValue}
					value={timeValue}
				/>*/}

			</div>

			<Button
				disabled={currentStep < 3}
				click={submit}
				fill={'#0263E0'}
			>
				<>
					<svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
						<g filter="url(#filter0_d_3052_181)">
							<path d="M13.684 0.70282C13.6577 0.602907 13.6053 0.511769 13.5322 0.43871C13.4592 0.365651 13.368 0.313288 13.2681 0.286967C12.0715 -0.0238394 10.8114 0.00963616 9.63297 0.383539C8.45452 0.757443 7.40564 1.45657 6.60709 2.40042L5.95671 3.17265L4.43724 2.80604C4.06784 2.67726 3.66432 2.68649 3.30119 2.83203C2.93806 2.97757 2.63986 3.24958 2.46166 3.59784L1.17821 5.87279C1.13324 5.95247 1.10765 6.04162 1.1035 6.13302C1.09936 6.22443 1.11677 6.31552 1.15434 6.39895C1.19191 6.48238 1.24859 6.5558 1.31978 6.61328C1.39097 6.67076 1.47469 6.71068 1.56416 6.72982L3.3566 7.11406C3.20476 7.57626 3.09634 8.05161 3.03275 8.53394C3.02122 8.62255 3.0302 8.71263 3.05899 8.79722C3.08778 8.88182 3.13561 8.95867 3.1988 9.02185L5.00719 10.8302C5.06133 10.8844 5.12563 10.9274 5.19639 10.9567C5.26716 10.9861 5.34301 11.0012 5.41961 11.0012C5.43641 11.0012 5.45322 11.0003 5.47031 10.9989C5.96342 10.9545 6.45055 10.8587 6.92373 10.713L7.29921 12.4649C7.31839 12.5544 7.35834 12.638 7.41583 12.7092C7.47332 12.7804 7.54673 12.837 7.63015 12.8746C7.71356 12.9121 7.80465 12.9296 7.89604 12.9254C7.98743 12.9213 8.07657 12.8958 8.15626 12.8508L10.4343 11.566C10.755 11.3712 11.0054 11.0795 11.1496 10.7332C11.2937 10.3868 11.3241 10.0036 11.2364 9.63881L10.8463 8.02939L11.568 7.36585C12.5153 6.56953 13.2172 5.52059 13.5918 4.34104C13.9664 3.16149 13.9983 1.89983 13.684 0.70282ZM2.58385 5.75515L3.49161 4.14529C3.54799 4.036 3.64405 3.95242 3.76009 3.91169C3.87613 3.87096 4.00335 3.87618 4.11567 3.92626L5.11749 4.16904L4.73833 4.61925C4.37885 5.05009 4.06794 5.51922 3.81122 6.01815L2.58385 5.75515ZM9.85814 10.5514L8.27392 11.4449L8.02337 10.2755C8.53124 10.0222 9.00439 9.70467 9.43118 9.33061L9.86491 8.9318L10.1003 9.90283C10.1308 10.0227 10.1239 10.1491 10.0807 10.265C10.0374 10.3809 9.95977 10.4808 9.85814 10.5514ZM10.7998 6.48832L8.65046 8.46362C7.79971 9.19937 6.75033 9.66702 5.63439 9.80774L4.23188 8.40523C4.42025 7.28639 4.90372 6.23806 5.6324 5.3684L6.61143 4.206C6.62774 4.18893 6.64296 4.17086 6.657 4.15188L7.49405 3.15807C8.11295 2.42709 8.91475 1.87346 9.81759 1.55369C10.7204 1.23393 11.692 1.1595 12.633 1.338C12.8158 2.28196 12.7421 3.25767 12.4197 4.1635C12.0973 5.06934 11.5379 5.87215 10.7998 6.48832ZM10.2614 2.89279C10.0883 2.89279 9.91915 2.94411 9.77526 3.04026C9.63136 3.1364 9.51921 3.27306 9.45298 3.43294C9.38676 3.59283 9.36943 3.76876 9.40319 3.9385C9.43695 4.10823 9.52029 4.26414 9.64266 4.38651C9.76503 4.50888 9.92094 4.59222 10.0907 4.62598C10.2604 4.65974 10.4363 4.64241 10.5962 4.57619C10.7561 4.50996 10.8928 4.39781 10.9889 4.25392C11.0851 4.11002 11.1364 3.94085 11.1364 3.76779C11.1364 3.65288 11.1138 3.53909 11.0698 3.43293C11.0258 3.32676 10.9614 3.2303 10.8801 3.14904C10.7989 3.06779 10.7024 3.00334 10.5962 2.95937C10.4901 2.9154 10.3763 2.89277 10.2614 2.89278L10.2614 2.89279Z" fill="white" />
						</g>
						<defs>
							<filter id="filter0_d_3052_181" x="0.102905" y="0.0761719" width="14.7954" height="14.8499" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
								<feFlood floodOpacity="0" result="BackgroundImageFix" />
								<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
								<feOffset dy="1" />
								<feGaussianBlur stdDeviation="0.5" />
								<feColorMatrix type="matrix" values="0 0 0 0 0.0705882 0 0 0 0 0.109804 0 0 0 0 0.176471 0 0 0 0.2 0" />
								<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_3052_181" />
								<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_3052_181" result="shape" />
							</filter>
						</defs>
					</svg>

					Launch
				</>
			</Button>
		</StepContainer>
	</div>
}

export default StepForm;
