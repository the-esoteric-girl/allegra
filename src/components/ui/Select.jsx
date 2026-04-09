import styles from './Select.module.css';
import { cn } from '../../lib/cn';

export default function Select({ id, name, value, onChange, className, label, options, children, variant, ...props }) {
  const isSort = variant === 'sort';

  const selectElement = (
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      {...props}
      className={cn(styles.select, isSort && styles.selectSort, className)}
    >
      {options ? (
        options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))
      ) : (
        children
      )}
    </select>
  );

  if (label) {
    return (
      <div className={isSort ? styles.wrapperSort : styles.wrapper}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        {selectElement}
      </div>
    );
  }

  return selectElement;
}
