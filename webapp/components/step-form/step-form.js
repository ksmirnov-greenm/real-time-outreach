import styles from './step-form.module.css';
import { useEffect, useState } from "react";
import StepContainer from "./step-container";
import Button from "../button/button";
import FileUploader from "../file-uploader/file-uploader";

import DatePicker from "react-datepicker";
import RadioGroup from "../radio-group/radio-group";
import TimePicker from "react-time-picker/dist/entry.nostyle";

const StepForm = ({
  patientListCollection,
  selectedPatientListSid,
  surveyCollection,
  selectedSurveySid,
  selectCurrentList,
  selectCurrentSurvey,
  uploadPatientList,
  uploadSurvey,
  submit,
	selectedDate,
	setSelectedDate,
	launchIsScheduled,
	setLaunchIsScheduled,
	timeValue,
	setTimeValue,
	removePatientList,
	removeSurvey,
	outreachMethod,
	selectOutreach
}) => {

	const [currentStep, setCurrentStep] = useState(1);
	
	const [overSid, setOverSid] = useState('');
	
	const scheduleOptions = [
		{ value: false, label: 'Send Immediately' },
		{ value: true, label: 'Schedule Outreach' }
	];

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

				<div
					key={patientList.sid}
					className={styles.filename}
					onMouseOver={() => setOverSid(patientList.sid)}
					onMouseLeave={() => setOverSid('')}
				>
					<input
						type="checkbox"
						value={patientList.sid}
						onChange={() => selectCurrentList(patientList.sid)}
						checked={patientList.sid === selectedPatientListSid}
						disabled={patientListCollection.length === 0}
					/>
					{patientList.data.fileName}
					
					{overSid === patientList.sid && <button title="Delete" className={styles.deleteBtn}  onClick={() => removePatientList(patientList.sid)}>
						<svg width="8" height="10" viewBox="0 0 8 10" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M7.33333 2.49999H5.66667V2.08333C5.66667 1.75181 5.53497 1.43387 5.30055 1.19944C5.06613 0.965024 4.74819 0.833328 4.41667 0.833328H3.58333C3.25181 0.833328 2.93387 0.965024 2.69945 1.19944C2.46503 1.43387 2.33333 1.75181 2.33333 2.08333V2.49999H0.666667C0.55616 2.49999 0.450179 2.54389 0.372039 2.62203C0.293899 2.70017 0.25 2.80615 0.25 2.91666C0.25 3.02717 0.293899 3.13315 0.372039 3.21129C0.450179 3.28943 0.55616 3.33333 0.666667 3.33333H1.08333V7.91666C1.08333 8.24818 1.21503 8.56612 1.44945 8.80055C1.68387 9.03497 2.00181 9.16666 2.33333 9.16666H5.66667C5.99819 9.16666 6.31613 9.03497 6.55055 8.80055C6.78497 8.56612 6.91667 8.24818 6.91667 7.91666V3.33333H7.33333C7.44384 3.33333 7.54982 3.28943 7.62796 3.21129C7.7061 3.13315 7.75 3.02717 7.75 2.91666C7.75 2.80615 7.7061 2.70017 7.62796 2.62203C7.54982 2.54389 7.44384 2.49999 7.33333 2.49999ZM3.16667 2.08333C3.16667 1.97282 3.21057 1.86684 3.28871 1.7887C3.36685 1.71056 3.47283 1.66666 3.58333 1.66666H4.41667C4.52717 1.66666 4.63315 1.71056 4.71129 1.7887C4.78943 1.86684 4.83333 1.97282 4.83333 2.08333V2.49999H3.16667V2.08333ZM6.08333 7.91666C6.08333 8.02717 6.03943 8.13315 5.96129 8.21129C5.88315 8.28943 5.77717 8.33333 5.66667 8.33333H2.33333C2.22283 8.33333 2.11685 8.28943 2.03871 8.21129C1.96057 8.13315 1.91667 8.02717 1.91667 7.91666V3.33333H6.08333V7.91666Z" fill="#F22F46"/>
						</svg>
					</button>}
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
				<div
					key={survey.sid}
					className={styles.filename}
					onMouseOver={() => setOverSid(survey.sid)}
					onMouseLeave={() => setOverSid('')}
				>
					<input
						type="checkbox"
						value={survey.sid}
						onChange={() => selectCurrentSurvey(survey.sid)}
						checked={survey.sid === selectedSurveySid || surveyCollection.length === 1}
						disabled={surveyCollection.length === 1 || currentStep < 2}
					/>
					<span className={`${currentStep < 2 ? styles.disabled : ''}`}>{survey.data.fileName}</span>
					{(overSid === survey.sid && currentStep >= 2) &&  <button className={styles.deleteBtn} onClick={() => removeSurvey(survey.sid)}>
						<svg width="8" height="10" viewBox="0 0 8 10" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M7.33333 2.49999H5.66667V2.08333C5.66667 1.75181 5.53497 1.43387 5.30055 1.19944C5.06613 0.965024 4.74819 0.833328 4.41667 0.833328H3.58333C3.25181 0.833328 2.93387 0.965024 2.69945 1.19944C2.46503 1.43387 2.33333 1.75181 2.33333 2.08333V2.49999H0.666667C0.55616 2.49999 0.450179 2.54389 0.372039 2.62203C0.293899 2.70017 0.25 2.80615 0.25 2.91666C0.25 3.02717 0.293899 3.13315 0.372039 3.21129C0.450179 3.28943 0.55616 3.33333 0.666667 3.33333H1.08333V7.91666C1.08333 8.24818 1.21503 8.56612 1.44945 8.80055C1.68387 9.03497 2.00181 9.16666 2.33333 9.16666H5.66667C5.99819 9.16666 6.31613 9.03497 6.55055 8.80055C6.78497 8.56612 6.91667 8.24818 6.91667 7.91666V3.33333H7.33333C7.44384 3.33333 7.54982 3.28943 7.62796 3.21129C7.7061 3.13315 7.75 3.02717 7.75 2.91666C7.75 2.80615 7.7061 2.70017 7.62796 2.62203C7.54982 2.54389 7.44384 2.49999 7.33333 2.49999ZM3.16667 2.08333C3.16667 1.97282 3.21057 1.86684 3.28871 1.7887C3.36685 1.71056 3.47283 1.66666 3.58333 1.66666H4.41667C4.52717 1.66666 4.63315 1.71056 4.71129 1.7887C4.78943 1.86684 4.83333 1.97282 4.83333 2.08333V2.49999H3.16667V2.08333ZM6.08333 7.91666C6.08333 8.02717 6.03943 8.13315 5.96129 8.21129C5.88315 8.28943 5.77717 8.33333 5.66667 8.33333H2.33333C2.22283 8.33333 2.11685 8.28943 2.03871 8.21129C1.96057 8.13315 1.91667 8.02717 1.91667 7.91666V3.33333H6.08333V7.91666Z" fill="#F22F46"/>
						</svg>
					</button>}
				</div>
			)}

		</StepContainer>

		<StepContainer
			step={3}
			currentStep={currentStep}
			title="Select dates"
			note="Select date and time we should send surveys"
		>
			<>
				<RadioGroup
					value={launchIsScheduled}
					options={scheduleOptions}
					onChange={(value) => setLaunchIsScheduled(value)}
					name={'Schedule'}
					disabled={currentStep < 3}
				/>
				
				{launchIsScheduled && <div className={styles.timeContainer}>
						<DatePicker
							selected={selectedDate}
							onChange={(date) => setSelectedDate(date)}
							disabled={currentStep < 3}
						/>
						<input
							className={styles.timePicker} 
							type="time"
							value={timeValue}
							onChange={(e) => setTimeValue(e.target.value)}
							disabled={currentStep < 3}
						/>
		
					</div>}
					<p className={`${styles.note} ${currentStep < 3 ? styles.disabled : ''}`}>
						Choose preferable flow of the survey
					</p>
					<select
						className={styles.outreachSelect}
						value={outreachMethod}
						onChange={(e) => selectOutreach(e.target.value)}
						disabled={currentStep < 3}
					>
						<option value='sms'>SMS invitation and Web flow</option>
						<option value='ivr'>IVR Flow</option>
					</select>
		
					<Button
						disabled={(currentStep) < 3}
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
				</>
		</StepContainer>
	</div>
}

export default StepForm;
