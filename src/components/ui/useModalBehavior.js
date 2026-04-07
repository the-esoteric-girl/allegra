import { useEffect } from 'react';

let openModalCount = 0;

export default function useModalBehavior({ isOpen, onEscape }) {
  useEffect(() => {
    if (!isOpen) return undefined;

    function handleEscape(event) {
      if (event.key === 'Escape') onEscape?.();
    }

    window.addEventListener('keydown', handleEscape);
    openModalCount += 1;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleEscape);
      openModalCount = Math.max(0, openModalCount - 1);
      if (openModalCount === 0) {
        document.body.style.overflow = previousOverflow;
      }
    };
  }, [isOpen, onEscape]);
}

