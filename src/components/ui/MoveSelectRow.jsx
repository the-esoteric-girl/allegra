import { Check } from 'lucide-react';
import styles from './MoveSelectRow.module.css';

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
      className={[styles.row, className].filter(Boolean).join(' ')}
    >
      <span
        className={[
          styles.checkbox,
          selected ? styles.checkboxSelected : '',
          checkboxClassName,
        ].filter(Boolean).join(' ')}
      >
        {selected && <Check size={11} strokeWidth={3} />}
      </span>
      <span className={[styles.label, labelClassName].filter(Boolean).join(' ')}>
        {label}
      </span>
    </button>
  );
}
