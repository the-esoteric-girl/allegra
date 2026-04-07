import styles from './Field.module.css';
import { cn } from '../../lib/cn';

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
    <div className={cn(styles.field, className)}>
      {label && (
        <label htmlFor={htmlFor} className={cn(styles.label, labelClassName)}>
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
