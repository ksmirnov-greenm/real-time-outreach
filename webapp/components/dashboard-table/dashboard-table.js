import styles from './dashboard-table.module.css';
import {useState} from "react";
import Dialog from "../dialog/dialog";
import {v4 as uuidV4} from 'uuid';


const DashboardTable = ({ data, fhirData }) => {
	
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
	
	function downloadHandler(){
		const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fhirData));
		const downloadAnchorNode = document.createElement('a');
		downloadAnchorNode.setAttribute("href",     dataStr);
		downloadAnchorNode.setAttribute("download",  "results.json");
		document.body.appendChild(downloadAnchorNode); // required for firefox
		downloadAnchorNode.click();
		downloadAnchorNode.remove();
	}
	
	
	return <>
		<div className={styles.container}>
			<div className={styles.pageHeader}>
				<h1 className={styles.title}>Dashboard</h1>
				<p className={styles.dashboardName}>{name}</p>
				<button className={styles.downloadBtn} onClick={downloadHandler}>
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
						<path fillRule="evenodd" clipRule="evenodd" d="M1.00016 8.33334C1.36835 8.33334 1.66683 8.63182 1.66683 9.00001V11.6667C1.66683 11.8435 1.73707 12.0131 1.86209 12.1381C1.98712 12.2631 2.15669 12.3333 2.3335 12.3333H11.6668C11.8436 12.3333 12.0132 12.2631 12.1382 12.1381C12.2633 12.0131 12.3335 11.8435 12.3335 11.6667V9.00001C12.3335 8.63182 12.632 8.33334 13.0002 8.33334C13.3684 8.33334 13.6668 8.63182 13.6668 9.00001V11.6667C13.6668 12.1971 13.4561 12.7058 13.081 13.0809C12.706 13.456 12.1973 13.6667 11.6668 13.6667H2.3335C1.80306 13.6667 1.29436 13.456 0.919282 13.0809C0.54421 12.7058 0.333496 12.1971 0.333496 11.6667V9.00001C0.333496 8.63182 0.631973 8.33334 1.00016 8.33334Z" fill="#0263E0"/>
						<path fillRule="evenodd" clipRule="evenodd" d="M3.19543 5.19527C3.45577 4.93492 3.87788 4.93492 4.13823 5.19527L7.00016 8.0572L9.86209 5.19527C10.1224 4.93492 10.5446 4.93492 10.8049 5.19527C11.0653 5.45562 11.0653 5.87773 10.8049 6.13808L7.47157 9.47141C7.21122 9.73176 6.78911 9.73176 6.52876 9.47141L3.19543 6.13808C2.93508 5.87773 2.93508 5.45562 3.19543 5.19527Z" fill="#0263E0"/>
						<path fillRule="evenodd" clipRule="evenodd" d="M7.00016 0.333344C7.36835 0.333344 7.66683 0.63182 7.66683 1.00001V9.00001C7.66683 9.3682 7.36835 9.66668 7.00016 9.66668C6.63197 9.66668 6.3335 9.3682 6.3335 9.00001V1.00001C6.3335 0.63182 6.63197 0.333344 7.00016 0.333344Z" fill="#0263E0"/>
					</svg>
					<span>Download</span>
					<svg xmlns="http://www.w3.org/2000/svg" width="6" height="5" viewBox="0 0 6 5" fill="none">
						<path d="M5.49985 1.085C5.40617 0.991876 5.27945 0.939606 5.14735 0.939606C5.01526 0.939606 4.88853 0.991876 4.79485 1.085L2.99985 2.855L1.22985 1.085C1.13617 0.991876 1.00945 0.939606 0.877352 0.939606C0.745259 0.939606 0.618533 0.991876 0.524852 1.085C0.477988 1.13148 0.440791 1.18678 0.415406 1.24771C0.390022 1.30864 0.376953 1.374 0.376953 1.44C0.376953 1.50601 0.390022 1.57136 0.415406 1.63229C0.440791 1.69322 0.477988 1.74852 0.524852 1.795L2.64485 3.915C2.69133 3.96187 2.74663 3.99906 2.80756 4.02445C2.86849 4.04983 2.93385 4.0629 2.99985 4.0629C3.06586 4.0629 3.13121 4.04983 3.19214 4.02445C3.25307 3.99906 3.30837 3.96187 3.35485 3.915L5.49985 1.795C5.54672 1.74852 5.58391 1.69322 5.6093 1.63229C5.63468 1.57136 5.64775 1.50601 5.64775 1.44C5.64775 1.374 5.63468 1.30864 5.6093 1.24771C5.58391 1.18678 5.54672 1.13148 5.49985 1.085Z" fill="#8891AA"/>
					</svg>
				</button>
			</div>
			
			
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
