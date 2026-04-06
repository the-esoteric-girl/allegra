import styles from './Button.module.css';

const variantClass = {
  primary: styles.primary,
  secondary: styles.secondary,
  subtle: styles.subtle,
  ghost: styles.ghost,
};

export default function Button({
  variant = 'primary',
  size = 'default',
  onClick,
  children,
  disabled,
  fullWidth,
  leftIcon,
  type = 'button',
  className,
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      {...props}
      className={[
        styles.button,
        variantClass[variant] ?? styles.primary,
        size === 'sm' ? styles.sm : '',
        fullWidth ? styles.fullWidth : '',
        disabled ? styles.disabled : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
      {children}
    </button>
  );
}
