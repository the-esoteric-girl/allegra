import styles from './Input.module.css';

export default function Input({
  placeholder,
  value,
  onChange,
  leftIcon,
  rightIcon,
  multiline,
  rows = 3,
  name,
  id,
  className,
  type = 'text',
}) {
  const wrapperClass = [
    styles.wrapper,
    leftIcon ? styles.hasLeft : '',
    rightIcon ? styles.hasRight : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const sharedProps = {
    className: styles.input,
    placeholder,
    value,
    onChange,
    name,
    id,
    type,
  };

  return (
    <div className={wrapperClass}>
      {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
      {multiline ? (
        <textarea {...sharedProps} rows={rows} />
      ) : (
        <input {...sharedProps} />
      )}
      {rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
    </div>
  );
}
