import styles from './Select.module.css';

export default function Select({ id, name, value, onChange, className, children, ...props }) {
  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      {...props}
      className={[styles.select, className].filter(Boolean).join(' ')}
    >
      {children}
    </select>
  );
}
