import { cn } from '../../lib/cn';
import styles from './PageState.module.css';

export default function PageState({ text, className }) {
  return <p className={cn(styles.state, className)}>{text}</p>;
}

