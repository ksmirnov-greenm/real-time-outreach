import { useRouter } from 'next/router';
import styles from './active-link.module.css'

function ActiveLink({ children, href }) {
	const router = useRouter()
	const style = {
		color: router.asPath === href ? '#606B85' : '#AEB2C1',
	}
	
	const handleClick = (e) => {
		e.preventDefault()
		void router.push(href);
	}
	
	return (
		<a href={href} onClick={handleClick} style={style} className={styles.link}>
			{children}
		</a>
	)
}

export default ActiveLink;
