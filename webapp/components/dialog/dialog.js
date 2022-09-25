import styles from './dialog.module.css';
import {createPortal} from "react-dom";

const Dialog = ({ children, onCLose }) => {
	console.log('dialog');
	
	return createPortal(
		<div className={styles.backdrop}>
			<div className={styles.dialogContainer}>
				<button onClick={onCLose} className={styles.close}>
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
						<circle cx="12" cy="12" r="12" fill="#E1E3EA"/>
						<path fillRule="evenodd" clipRule="evenodd" d="M15.8326 8.16738C16.0558 8.39053 16.0558 8.75234 15.8326 8.9755L8.97549 15.8326C8.75233 16.0558 8.39052 16.0558 8.16737 15.8326C7.94421 15.6095 7.94421 15.2477 8.16737 15.0245L15.0245 8.16738C15.2477 7.94422 15.6095 7.94422 15.8326 8.16738Z" fill="#4B5671"/>
						<path fillRule="evenodd" clipRule="evenodd" d="M8.16737 8.16738C8.39052 7.94422 8.75233 7.94422 8.97549 8.16738L15.8326 15.0245C16.0558 15.2477 16.0558 15.6095 15.8326 15.8326C15.6095 16.0558 15.2477 16.0558 15.0245 15.8326L8.16737 8.9755C7.94421 8.75234 7.94421 8.39053 8.16737 8.16738Z" fill="#4B5671"/>
					</svg>
				</button>
				{children}
			</div>
		</div>,
		document.body
	)
}

export default Dialog;
