// Сжатый вид статьи и перевода на карточке: окошки вокруг цитат (windows.js) вместо рядов. Флаг хода
// compressed действует с двумя и более цитатами, как у абзаца. Переход навигатора к части вне окошек
// показывает ход целиком у себя, до смены флага или перезагрузки.

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { rowsQuoteIndex } from './quotes';
import { quoteWindows } from './windows';

// Около двух строк текста по ширине карточки при средней ширине знака в половину кегля; ступенями,
// чтобы ресайз не перерезал куски на каждом шаге.
const FONT_SIZE = 18;
const contextFor = (width) =>
  Math.max(80, Math.round((((width || 768) - 40) / (FONT_SIZE * 0.5)) * 2 / 40) * 40);

// rows — все ряды хода; md — экземпляр markdown-it рендера (у статьи; до загрузки — null); single — статья;
// width — ширина карточки; bodyRef — скроллер тела: при смене вида он уходит в начало. Ответ: active —
// сжатый вид на деле; rows — части для сетки; windows — части-окошки; revealPart, refRows — пропсы
// сетки; sizeKey — меняется, когда окошки разложены: карточка пересчитывает высоту.
export const useQuoteWindows = ({ rows, compressed, md, single = false, width, bodyRef }) => {
  const quotes = useMemo(() => rowsQuoteIndex(rows).count, [rows]);
  const flagged = !!compressed && quotes > 1;
  const [whole, setWhole] = useState({ flagged, on: false });
  const active = flagged && !(whole.flagged === flagged && whole.on);
  const context = single ? contextFor(width) : 0;
  const parts = useMemo(
    () => (active && (md || !single) ? quoteWindows(rows, { md, single, context }) : null),
    [active, rows, md, single, context],
  );
  const revealPart = useCallback(() => {
    if (!parts) return false;
    setWhole({ flagged, on: true });
    return true;
  }, [parts, flagged]);

  const shownBefore = useRef(active);
  const [sizeKey, setSizeKey] = useState(0);
  useLayoutEffect(() => {
    if (shownBefore.current === active) return undefined;
    shownBefore.current = active;
    if (bodyRef?.current) bodyRef.current.scrollTop = 0;
    // высота — после замера отрисованных окошек (два кадра), а не по оценкам первого
    let frames = 0;
    let raf = requestAnimationFrame(function tick() {
      frames += 1;
      if (frames < 2) raf = requestAnimationFrame(tick);
      else setSizeKey((n) => n + 1);
    });
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return {
    active,
    rows: parts || rows,
    windows: !!parts,
    revealPart,
    refRows: rows,
    sizeKey,
  };
};
