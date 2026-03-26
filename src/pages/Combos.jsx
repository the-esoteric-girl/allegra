import styles from './Library.module.css';

export default function Combos() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.appName}>Combos</div>
        <div className={styles.subtitle}>Build your sequences</div>
      </div>

      <div className={styles.moveCard} style={{ cursor: 'default', textAlign: 'center', padding: '32px 20px' }}>
        <div style={{ fontSize: '28px', marginBottom: '12px' }}>🔗</div>
        <div className={styles.moveName} style={{ marginBottom: '8px' }}>Coming soon</div>
        <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          Chain moves into sequences, save your favourite combos, and build class material from your own library.
        </div>
      </div>
    </div>
  );
}
