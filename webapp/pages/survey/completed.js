import styles from "./index.module.css";
import Logo from "../../components/logo/logo";

export default function Completed() {
	return <div className={styles.container}>
		<div className={styles.logo}>
			<Logo color={"#FAFDFF"}/>
		</div>
		<div className={styles.contentContainer}>
			<div className={`${styles.text} ${styles.xl}`}>Thanks for completing this survey! </div>
			<div className={`${styles.text} ${styles.md}`}>We highly appreciate your feedback</div>
		</div>
		
		
		<footer className={styles.footer}>
			<span className={styles.footerText}>© 2022 Cloud City Healthcare</span>
			<a className={styles.footerText} href="" onClick={e => e.preventDefault()}>Privacy Policy</a>
			<a className={styles.footerText} href="" onClick={e => e.preventDefault()}>Terms of Service</a>
		</footer>
	</div>
}
