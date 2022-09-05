import styles from "./step-form.module.css";
import StepNumber from "./step-number";

const StepContainer = (
	{step,
	currentStep,
	title,
	note,
	children}
) => {
	
	const isActive = step === currentStep;
	const isPassed = currentStep > step;
	const isDisabled = step > currentStep;
	
	return <div  className={isDisabled ? styles.disabled : ''}>
		<div className={styles.header}>
			<StepNumber step={step} currentStep={currentStep} isActive={isActive} isPassed={isPassed}/>
			<h1 className={`${styles.title} ${isDisabled ? styles.disabled : ''}`}>{title}</h1>
		</div>
		<div className={styles.content}>
			{note && <span className={`${styles.note} ${isDisabled ? styles.disabled : ''}`}>{note}</span>}
			{children}
		</div>
	</div>
}

export default StepContainer;
