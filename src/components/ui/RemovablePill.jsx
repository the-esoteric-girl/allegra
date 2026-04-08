import { X } from 'lucide-react';
import styles from './RemovablePill.module.css';
import { cn } from '../../lib/cn';

export default function RemovablePill({
  children,
  onRemove,
  onClick,
  disabled = false,
  className,
  label = 'Remove item',
}) {
  return (
    <div className={cn(styles.pill, className)}>
      {onClick ? (
        <button
          type="button"
          className={styles.content}
          onClick={onClick}
        >
          {children}
        </button>
      ) : (
        <span className={styles.content}>{children}</span>
      )}
      {onRemove && (
        <button
          type="button"
          className={styles.remove}
          onClick={onRemove}
          aria-label={label}
          disabled={disabled}
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
