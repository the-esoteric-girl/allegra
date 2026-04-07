import { Check } from 'lucide-react';
import styles from './MoveSelectRow.module.css';
import { cn } from '../../lib/cn';

export default function MoveSelectRow({
  label,
  selected,
  onClick,
  className,
  checkboxClassName,
  labelClassName,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(styles.row, className)}
    >
      <span
        className={cn(
          styles.checkbox,
          selected && styles.checkboxSelected,
          checkboxClassName
        )}
      >
        {selected && <Check size={11} strokeWidth={3} />}
      </span>
      <span className={cn(styles.label, labelClassName)}>
        {label}
      </span>
    </button>
  );
}
