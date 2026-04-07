import { Check } from 'lucide-react';
import StatusDot from './StatusDot';
import styles from './StatusOptionButton.module.css';
import { cn } from '../../lib/cn';

export default function StatusOptionButton({
  status,
  label,
  selected,
  onClick,
  variant = 'menu',
  showCheck = false,
  className,
  ...props
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      {...props}
      className={cn(
        styles.option,
        variant === 'list' ? styles.list : styles.menu,
        selected && styles.selected,
        className
      )}
    >
      <StatusDot status={status} size={7} />
      <span className={styles.label}>{label}</span>
      {showCheck && selected && <Check size={13} />}
    </button>
  );
}
