import styles from './Card.module.css';
import { cn } from '../../lib/cn';

const paddingClass = {
  default: styles.paddingDefault,
  sm: styles.paddingSm,
  none: styles.paddingNone,
};

const toneClass = {
  default: styles.toneDefault,
  blueTint: styles.toneBlueTint,
  pinkTint: styles.tonePinkTint,
};

const elevationClass = {
  shadow: styles.elevationShadow,
  flat: styles.elevationFlat,
};

export default function Card({
  children,
  onClick,
  className,
  padding = 'default',
  tone = 'default',
  elevation = 'auto',
}) {
  const resolvedElevation = elevation === 'auto'
    ? (tone === 'default' ? 'shadow' : 'flat')
    : elevation;

  return (
    <div
      className={cn(
        styles.card,
        paddingClass[padding] ?? styles.paddingDefault,
        toneClass[tone] ?? styles.toneDefault,
        elevationClass[resolvedElevation] ?? styles.elevationShadow,
        onClick && styles.clickable,
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
