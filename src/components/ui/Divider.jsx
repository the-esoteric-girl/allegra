import styles from './Divider.module.css';

const spacingClass = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
};

export default function Divider({ spacing = 'md' }) {
  return <hr className={`${styles.divider} ${spacingClass[spacing] ?? styles.md}`} />;
}
