import Button from './Button';
import styles from './ConfirmDialog.module.css';
import useModalBehavior from './useModalBehavior';

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  testIdPrefix = 'confirm-dialog',
}) {
  useModalBehavior({
    isOpen,
    onEscape: !loading ? onCancel : undefined,
  });

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={!loading ? onCancel : undefined} />
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        data-testid={testIdPrefix}
      >
        <h2 id="confirm-dialog-title" className={styles.title} data-testid={`${testIdPrefix}-title`}>{title}</h2>
        {message ? <p className={styles.message}>{message}</p> : null}
        <div className={styles.actions}>
          <Button variant="subtle" onClick={onCancel} disabled={loading} data-testid={`${testIdPrefix}-cancel`}>
            {cancelLabel}
          </Button>
          <Button
            variant="primary"
            className={styles.confirmButton}
            onClick={onConfirm}
            disabled={loading}
            data-testid={`${testIdPrefix}-confirm`}
          >
            {loading ? 'Deleting...' : confirmLabel}
          </Button>
        </div>
      </div>
    </>
  );
}
