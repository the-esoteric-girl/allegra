import styles from './IconButton.module.css';

export default function IconButton({
  icon,
  onClick,
  variant = 'default',
  size = 'default',
  label,
  ...props
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      {...props}
      className={[
        styles.button,
        variant === 'ghost' ? styles.ghost : styles.default,
        size === 'sm' ? styles.sm : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {icon}
    </button>
  );
}
