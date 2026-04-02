import styles from './Card.module.css';

const paddingClass = {
  default: styles.paddingDefault,
  sm: styles.paddingSm,
  none: styles.paddingNone,
};

export default function Card({ children, onClick, className, padding = 'default' }) {
  return (
    <div
      className={[
        styles.card,
        paddingClass[padding] ?? styles.paddingDefault,
        onClick ? styles.clickable : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
