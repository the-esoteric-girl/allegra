import styles from './Field.module.css';

export default function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
  labelClassName,
  contentClassName,
}) {
  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      {label && (
        <label htmlFor={htmlFor} className={[styles.label, labelClassName].filter(Boolean).join(' ')}>
          {label}
        </label>
      )}
      {hint && <p className={styles.hint}>{hint}</p>}
      <div className={contentClassName}>{children}</div>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
