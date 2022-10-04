import styles from './dashboard-table.module.css';
import {useState} from "react";
import Dialog from "../dialog/dialog";
import {v4 as uuidV4} from 'uuid';


const DashboardTable = ({ data }) => {
	
	const [showResultsDialog, setShowResultsDialog] = useState(false);
	const [selectedPatient, setSelectedPatient] = useState(null);
	
	const name = data ? data.surveyName : '';
	const patients = data ? data.patients : [];
	
	const showResults = (patient) => {
		console.log('show results: ', patient);
		setSelectedPatient(patient);
		setShowResultsDialog(true);
	} 
	
	console.log('selectedResults', selectedPatient);
	
	
	return <>
		<div className={styles.container}>
			<h1 className={styles.title}>Dashboard</h1>
			<p className={styles.dashboardName}>{name}</p>
			
			<table className={styles.table}>
				<thead>
					<tr>
						<th>Name</th>
						<th>Outreach Event</th>
						<th>Results</th>
						<th>Sentiment</th>
					</tr>
				</thead>
				<tbody>
					{patients.map(patient => <tr key={patient.name}>
						<td>{patient.name}</td>
						<td>{patient.status}</td>
						<td>
							{patient.results.length > 0 && <a href="" onClick={(e) => {
								e.preventDefault();
								showResults(patient)
							}}>Results</a>}
							{patient.results.length === 0 && <svg xmlns="http://www.w3.org/2000/svg" width="12" height="2" viewBox="0 0 12 2" fill="none">
								<path d="M12 0.759943V1.86364H0V0.759943H12Z" fill="#AEB2C1"/>
							</svg>}
						</td>
						<td className={styles.sentiment}>
						{!patient.sentiment && <span>-</span>}
						{patient.sentiment === "NEGATIVE" && <span className={styles.negativeSentiment}>{patient.sentiment}</span>}
						{patient.sentiment === "POSITIVE" && <span className={styles.positiveSentiment}>{patient.sentiment}</span>}
						{(patient.sentiment === "NEUTRAL" || patient.sentiment === "MIX") && <span>{patient.sentiment}</span>}
						</td>
						</tr>)}
				</tbody>
			</table>
		</div>
		{showResultsDialog && <Dialog onCLose={() => {
			setShowResultsDialog(false);
			setSelectedPatient(null);
		}}>
			<div>
				<p className={styles.dialogTitle}>Results&nbsp;<span className={styles.dialogPatient}>({selectedPatient.name})</span></p>
				<table className={styles.dialogTable}>
					<tbody>
					{selectedPatient.results.map((result, index) => <tr key={uuidV4()}>
						<td>{index + 1}</td>
						<td>{result.text}</td>
						<td>
							{result.type === "boolean" && result.answer === "true" && <span>
								<svg xmlns="http://www.w3.org/2000/svg" width="10" height="8" viewBox="0 0 10 8" fill="none">
									<path d="M9.47297 0.806667C9.411 0.744182 9.33727 0.694585 9.25603 0.66074C9.17479 0.626894 9.08765 0.609468 8.99964 0.609468C8.91163 0.609468 8.8245 0.626894 8.74326 0.66074C8.66202 0.694585 8.58828 0.744182 8.52631 0.806667L3.55964 5.78L1.47297 3.68667C1.40863 3.62451 1.33267 3.57563 1.24943 3.54283C1.16619 3.51003 1.07731 3.49394 0.987856 3.49549C0.898402 3.49704 0.810129 3.51619 0.728077 3.55185C0.646025 3.58751 0.5718 3.63899 0.509641 3.70333C0.447482 3.76768 0.398606 3.84364 0.365803 3.92688C0.333001 4.01012 0.316914 4.099 0.318461 4.18845C0.320009 4.27791 0.339161 4.36618 0.374823 4.44823C0.410485 4.53028 0.46196 4.60451 0.526308 4.66667L3.08631 7.22667C3.14828 7.28915 3.22202 7.33875 3.30326 7.37259C3.3845 7.40644 3.47163 7.42387 3.55964 7.42387C3.64765 7.42387 3.73479 7.40644 3.81603 7.37259C3.89727 7.33875 3.971 7.28915 4.03297 7.22667L9.47297 1.78667C9.54064 1.72424 9.59465 1.64847 9.63159 1.56414C9.66853 1.47981 9.6876 1.38874 9.6876 1.29667C9.6876 1.2046 9.66853 1.11353 9.63159 1.0292C9.59465 0.944863 9.54064 0.869096 9.47297 0.806667Z" fill="#14B053"/>
								</svg>
								&nbsp;
								Yes
							</span>}
							{result.type === "boolean" && result.answer === "false" && <span>
								<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
									<path d="M6.82813 0.228763L3.9997 3.05719L1.17127 0.228763C1.04625 0.103739 0.87668 0.0335011 0.69987 0.0335011C0.523059 0.0335011 0.353489 0.103739 0.228465 0.228763C0.103441 0.353787 0.0332031 0.523357 0.0332031 0.700168C0.0332031 0.876979 0.103441 1.04655 0.228465 1.17157L3.05689 4L0.228465 6.82843C0.103441 6.95345 0.0332031 7.12302 0.0332031 7.29983C0.0332031 7.47664 0.103441 7.64621 0.228465 7.77124C0.353489 7.89626 0.523059 7.9665 0.69987 7.9665C0.87668 7.9665 1.04625 7.89626 1.17127 7.77124L3.9997 4.94281L6.82813 7.77124C6.95315 7.89626 7.12272 7.9665 7.29953 7.9665C7.47634 7.9665 7.64591 7.89626 7.77094 7.77124C7.89596 7.64621 7.9662 7.47664 7.9662 7.29983C7.9662 7.12302 7.89596 6.95345 7.77094 6.82843L4.94251 4L7.77094 1.17157C7.89596 1.04655 7.9662 0.876978 7.9662 0.700167C7.9662 0.523356 7.89596 0.353787 7.77094 0.228763C7.64591 0.103739 7.47634 0.0335007 7.29953 0.0335007C7.12272 0.0335007 6.95315 0.103739 6.82813 0.228763Z" fill="#D61F1F"/>
								</svg>
								&nbsp;
								No
							</span>}
							{result.type === "text" && <span>{result.answer}</span>}
						</td>
					</tr>)}
					</tbody>
				</table>
			</div>
		</Dialog>}
	</>
}

export default DashboardTable;
