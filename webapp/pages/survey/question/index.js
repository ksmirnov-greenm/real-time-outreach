import styles from './index.module.css';
import Logo from "../../../components/logo/logo";
import SurveyButton from "../../../components/survey-button/survey-button";
import {useEffect, useState} from "react";
import {useRouter} from "next/router";
import surveyService from "../../../services/surveyService";
import segmentService from "../../../services/segmentService";


export default function Index () {
	
	const [title, setTitle] = useState('');
	const [questions, setQuestions] = useState([]);
	const [questionIndex, setQuestionIndex] = useState(0);
	const [patientId, setPatientId] = useState('');
	const [survey, setSurvey] = useState({});
	
	const [selectedQuestion, setSelectedQuestion] = useState(null);
	const [currentAnswer, setCurrentAnswer] = useState(undefined);
	const [answers, setAnswers] = useState([]);
	const router = useRouter();
	
	const {runId} = router.query;
	
	
	const  nextQuestion = async () => {
		const newAnswers = [...answers, currentAnswer];
		await segmentService.track({
							  event: 'survey_question_answered', //TODO: create shared list
							  runId: runId, 
							  surveyId: survey.id,
							  question: questions[questionIndex],
							  answer: currentAnswer});

		setAnswers(newAnswers);
		setCurrentAnswer(undefined);
		const newIndex = questionIndex + 1;
		
		if(questions.length > newIndex) {
			setQuestionIndex(newIndex);
			setSelectedQuestion(questions[newIndex])
		} else {
			console.log('submit', newAnswers);
			await segmentService.track({
				event: 'survey_completed', //TODO: create shared list
				runId: runId});

			void await router.push('/survey/completed');
		}
	}
	
	useEffect(() => {
		if(runId) {
			surveyService.getPatientSurveyByRunId(runId)
				.then(res => {
						setSurvey(res.survey);
						setPatientId(res.patientId);
						setTitle(res.survey.title);
						if(res.survey.item.length) {
							setQuestions(res.survey.item);
							setSelectedQuestion(res.survey.item[questionIndex]);
						}
				})
		}
	}, []);
	
	return <div className={styles.container}>
		<header className={styles.header}>
			<Logo color={"#008CFF"}/>
			<span className={styles.headerText}>{title}</span>
		</header>
		{runId && <main className={styles.content}>
			<div className={styles.questionNumber}>{questionIndex + 1}</div>
			{selectedQuestion && <div className={styles.questionBlock}>
				<p className={styles.questionText}>{selectedQuestion.text}</p>
				{selectedQuestion.type === 'boolean' && <div>
					<SurveyButton
						click={() => setCurrentAnswer(true)}
						selected={currentAnswer === true}
						isPositive
					>Yes</SurveyButton>
					<SurveyButton
						click={() => setCurrentAnswer(false)}
						selected={currentAnswer === false}
					>No</SurveyButton>
				</div>}
				
				{selectedQuestion.type === 'text' && <textarea
					className={styles.textarea}
					value={currentAnswer}
					onChange={event => setCurrentAnswer(event.target.value)}
					placeholder="Type your answer here"
				>
				</textarea>}
				
				<button
					onClick={nextQuestion}
					className={styles.nextButton}
					disabled={currentAnswer === undefined}
				>
					{(questions.length -1 === questionIndex) ? 'Submit' : 'Next'}
				</button>
			</div>}
			<span className={styles.totalQuestions}>{questionIndex + 1} of {questions.length}</span>
		</main>}
		{!runId && <h3>Unable to load questions...</h3>}
		<footer className={styles.footer}>
			<span className={styles.footerText}>© 2022 Cloud City Healthcare</span>
			<a className={styles.footerText} href="" onClick={e => e.preventDefault()}>Privacy Policy</a>
			<a className={styles.footerText} href="" onClick={e => e.preventDefault()}>Terms of Service</a>
		</footer>
	</div>
}
