import styles from './Input.module.css';
import { cn } from '../../lib/cn';

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
  const wrapperClass = cn(
    styles.wrapper,
    leftIcon && styles.hasLeft,
    rightIcon && styles.hasRight,
    className,
    wrapperClassName
  );

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
          className={cn(styles.input, inputClassName)}
        />
      ) : (
        <input
          {...sharedProps}
          ref={inputRef}
          type={type}
          className={cn(styles.input, inputClassName)}
        />
      )}
      {rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
    </div>
  );
}
