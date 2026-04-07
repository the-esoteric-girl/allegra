import styles from './IconButton.module.css';
import { cn } from '../../lib/cn';

export default function IconButton({
  icon,
  onClick,
  variant = 'default',
  size = 'default',
  label,
  className,
  ...props
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      {...props}
      className={cn(
        styles.button,
        variant === 'ghost' ? styles.ghost : styles.default,
        size === 'sm' && styles.sm,
        className
      )}
    >
      {icon}
    </button>
  );
}
