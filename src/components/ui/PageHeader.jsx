import styles from './PageHeader.module.css';

export default function PageHeader({
  title,
  leftAction,
  rightAction,
  bleed,
  noBorder,
  className,
}) {
  return (
    <header className={[styles.header, bleed && styles.bleed, noBorder && styles.noBorder, className].filter(Boolean).join(' ')}>
      <div className={styles.side}>{leftAction}</div>
      <h1 className={styles.title}>{title}</h1>
      <div className={`${styles.side} ${styles.sideRight}`}>
        {rightAction || <span className={styles.spacer} aria-hidden="true" />}
      </div>
    </header>
  );
}
