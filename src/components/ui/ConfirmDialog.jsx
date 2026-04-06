import { useEffect } from 'react';
import Button from './Button';
import styles from './ConfirmDialog.module.css';

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;

    function handleEscape(event) {
      if (event.key === 'Escape' && !loading) {
        onCancel?.();
      }
    }

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={!loading ? onCancel : undefined} />
      <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
        <h2 id="confirm-dialog-title" className={styles.title}>{title}</h2>
        {message ? <p className={styles.message}>{message}</p> : null}
        <div className={styles.actions}>
          <Button variant="subtle" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant="primary" className={styles.confirmButton} onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting...' : confirmLabel}
          </Button>
        </div>
      </div>
    </>
  );
}
