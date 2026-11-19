import { useEffect } from 'react';

// Яндекс Браузер пропускает нативную прокрутку над пустыми областями сетки.
// Один обработчик на скроллере охватывает ячейки, промежутки и ленивые разделители.
export const translationWheel = (box, event) => {
  if (event.defaultPrevented || event.ctrlKey || event.shiftKey || !event.deltaY) return;
  const unit = event.deltaMode === 1 ? 22 : event.deltaMode === 2 ? box.clientHeight : 1;
  const next = Math.max(0, Math.min(box.scrollHeight - box.clientHeight, box.scrollTop + event.deltaY * unit));
  if (next === box.scrollTop) return;
  event.preventDefault();
  event.stopPropagation();
  box.scrollTop = next;
};

export const useTranslationWheel = (ref) => {
  // Ref может смениться при возврате из Preview, даже если сам редактор остался.
  const box = ref.current;
  useEffect(() => {
    if (!box) return;
    const wheel = (event) => translationWheel(box, event);
    box.addEventListener('wheel', wheel, { passive: false });
    return () => box.removeEventListener('wheel', wheel);
  }, [box]);
};
