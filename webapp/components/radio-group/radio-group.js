import {useEffect, useState} from "react";
import {v4 as uuidV4} from 'uuid';
import styles from './radio-group.module.css';

const RadioGroup = ({
  value,
  onChange,
  options,
  name,
	disabled
} ) => {
	
		return <div className={styles.radioGroupContainer}>
			{options.map(item => <div key={uuidV4()} className={styles.radioItemContainer}>
				<input
					type="radio"
					id={`radio-group-id-${item.label}`}
				  name={name} value={item.value}
					checked={item.value === value}
					onChange={() => onChange(item.value)}
					disabled={disabled}
					className={styles.radioInput}
				/>
				<label
					htmlFor={`radio-group-id-${item.label}`}
					className={`${styles.radioItemLabel} ${disabled ? styles.disabled : ''}`}
				>{item.label}</label>
			</div>)}
		</div>
}

export default RadioGroup;
