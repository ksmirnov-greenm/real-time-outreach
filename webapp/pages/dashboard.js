import Layout from "../components/layout/layout";
import {useEffect, useState} from "react";
import datastoreService from "../services/datastoreService";
import DashboardTable from "../components/dashboard-table/dashboard-table";

export default function Dashboard () {
	
	const [dashboardData, setDashboardData] = useState(null);
	
	useEffect(() => {
		datastoreService.fetchDashboardData().then((data) => {
			setDashboardData(data)
		})
		
	}, []);
	
	return <>
		<DashboardTable data={dashboardData}/>
	</>
}

Dashboard.getLayout = function getLayout(page) {
	return (
		<Layout>
			{page}
		</Layout>
	)
}
