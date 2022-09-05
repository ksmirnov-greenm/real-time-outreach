import Layout from "../components/layout/layout";

export default function Survey () {
	return <div>
		<h1>Survey will be ready soon. Development in progress...</h1>
	</div>
}

Survey.getLayout = function getLayout(page) {
	return (
		<Layout>
			{page}
		</Layout>
	)
}
