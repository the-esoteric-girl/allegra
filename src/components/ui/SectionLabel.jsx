import styles from './SectionLabel.module.css';

export default function SectionLabel({ children, className }) {
  return (
    <p className={[styles.label, className].filter(Boolean).join(' ')}>
      {children}
    </p>
  );
}
