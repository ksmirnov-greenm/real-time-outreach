import styles from './index.module.css';
import Logo from "../../components/logo/logo";
import Button from "../../components/button/button";
import {useRouter} from "next/router";
import segmentService from "../../services/segmentService";

export default function Survey() {


	const router = useRouter();
	const {runId} = router.query;
	
	//TODO: this page load two times, should be fixed
	segmentService.track({
		event: 'survey_page_opened', //TODO: create shared list
		runId: runId 
		}).then(t=>console.log(t));

		const startSurvey = () => {
		void router.push({
			pathname: '/survey/question',
			query: { runId }
		})
	}
	
	return <div className={styles.layoutContainer}>
			<div className={styles.container}>
				<div className={styles.logo}>
					<Logo color={"#FAFDFF"}/>
				</div>
				
				<div className={styles.contentContainer}>
					<div className={`${styles.text} ${styles.xl}`}>We&apos;d love to know a bit more about your vision.</div>
					<div className={`${styles.text} ${styles.md}`}>Results of your vision checkout survey will be used for effective provision of medical care</div>
					
					<div className={styles.buttonContainer}>
						<Button click={startSurvey}>Give Feedback</Button>
					</div>
				</div>
				
				<footer className={styles.footer}>
					<span className={styles.footerText}>© 2022 Cloud City Healthcare</span>
					<a className={styles.footerText} href="" onClick={e => e.preventDefault()}>Privacy Policy</a>
					<a className={styles.footerText} href="" onClick={e => e.preventDefault()}>Terms of Service</a>
				</footer>
		</div>
	</div>
}
