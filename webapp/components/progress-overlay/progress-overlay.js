import styles from './progress-overlay.module.css';

const ProgressOverlay = ({ requestCount, current }) => {
	
	const width = (100 * current) / requestCount;
	
	const inlineStyle = {
		width: `${width}%`
	};
	
	const titleColor = width > 50 ? '#fff' : '#0263E0';
	
	return <div className={styles.overlayContainer}>
		<h1 className={styles.label}>Outreach in progress. Please do not close the window</h1>
		<div className={styles.progressContainer}>
			<div className={styles.progress} style={inlineStyle}/>
			{requestCount > 0 && <span
				className={styles.progressTitle}
				style={{color: titleColor}}
			><span style={{color: width === 50 ? '#fff' : titleColor}}>{current}</span>&nbsp;/ {requestCount}</span>}
		</div>
	</div>
}

export default ProgressOverlay;
