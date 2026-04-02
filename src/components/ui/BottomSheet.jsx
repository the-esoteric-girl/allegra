import styles from './BottomSheet.module.css';

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  showHandle = true,
  leftAction,
  rightAction,
}) {
  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.sheet} role="dialog" aria-modal="true">
        {showHandle && <div className={styles.handle} />}
        <div className={styles.header}>
          <div className={styles.side}>{leftAction}</div>
          <h2 className={styles.title}>{title}</h2>
          <div className={`${styles.side} ${styles.sideRight}`}>{rightAction}</div>
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </>
  );
}
