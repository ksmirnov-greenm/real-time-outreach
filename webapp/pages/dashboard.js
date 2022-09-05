import Layout from "../components/layout/layout";

export default function Dashboard () {
	return <div>
		<h1>Dashboard will be ready soon. Development in progress...</h1>
	</div>
}

Dashboard.getLayout = function getLayout(page) {
	return (
		<Layout>
			{page}
		</Layout>
	)
}
