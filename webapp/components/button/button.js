import styles from './button.module.css';

const Button = ({click, children, disabled, fill}) => {
	
	let inlineStyles = {};
	if(fill && !disabled) {
		inlineStyles = {
			background: fill,
			color: '#fff',
		}
	}
	
	return <button
		onClick={click}
		disabled={disabled}
		className={styles.button}
		style={inlineStyles}
	>{children}</button>
}

export default Button;
