import Layout from "../components/layout/layout";
import {useEffect, useState} from "react";
import datastoreService from "../services/datastoreService";
import helperService from "../services/helperService";
import DashboardTable from "../components/dashboard-table/dashboard-table";

export default function Dashboard () {
	
	const [dashboardData, setDashboardData] = useState(null);
	const [fhirDashboardData, setFhirDashboardData] = useState(null);
	
	useEffect(() => {
		datastoreService.fetchDashboardData().then((data) => {
			setDashboardData(data);
		})

	}, []);
	
	useEffect(() => {
			setFhirDashboardData(helperService.surveyResults2fhir(dashboardData));
	}, [dashboardData]);
	
	return <>
		<DashboardTable data={dashboardData} fhirData={fhirDashboardData}/>
	</>
}

Dashboard.getLayout = function getLayout(page) {
	return (
		<Layout>
			{page}
		</Layout>
	)
}
