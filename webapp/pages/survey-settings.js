import Layout from "../components/layout/layout";

export default function SurveySettings () {
	return <div>
		<h1>Survey Settings will be ready soon. Development in progress...</h1>
	</div>
}

SurveySettings.getLayout = function getLayout(page) {
	return (
		<Layout>
			{page}
		</Layout>
	)
}
