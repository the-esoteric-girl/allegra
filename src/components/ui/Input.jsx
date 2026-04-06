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
  inputRef,
  inputClassName,
  wrapperClassName,
  className,
  type = 'text',
  ...props
}) {
  const wrapperClass = [
    styles.wrapper,
    leftIcon ? styles.hasLeft : '',
    rightIcon ? styles.hasRight : '',
    className,
    wrapperClassName,
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
    ...props,
  };

  return (
    <div className={wrapperClass}>
      {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
      {multiline ? (
        <textarea
          {...sharedProps}
          ref={inputRef}
          rows={rows}
          className={[styles.input, inputClassName].filter(Boolean).join(' ')}
        />
      ) : (
        <input
          {...sharedProps}
          ref={inputRef}
          type={type}
          className={[styles.input, inputClassName].filter(Boolean).join(' ')}
        />
      )}
      {rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
    </div>
  );
}
