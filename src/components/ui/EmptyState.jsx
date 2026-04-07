import { cn } from '../../lib/cn';
import styles from './EmptyState.module.css';

export default function EmptyState({
  title,
  body,
  action,
  className,
  titleClassName,
  bodyClassName,
}) {
  return (
    <div className={cn(styles.root, className)}>
      {title ? <p className={cn(styles.title, titleClassName)}>{title}</p> : null}
      {body ? <p className={cn(styles.body, bodyClassName)}>{body}</p> : null}
      {action || null}
    </div>
  );
}

