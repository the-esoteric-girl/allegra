import styles from './SectionLabel.module.css';
import { cn } from '../../lib/cn';

export default function SectionLabel({ children, className }) {
  return (
    <p className={cn(styles.label, className)}>
      {children}
    </p>
  );
}
