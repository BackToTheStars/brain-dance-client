// Карточка хода «Перевод текста»: ряды { id, left, right } в одном прокручиваемом теле, ряд —
// две равные колонки (высота по большей ячейке), над рядами — языки колонок, если заданы.
// Ячейка — md; выделение с id — текстовая цитата хода, в любой колонке. Список цитат выводится
// из рядов (quotes.js) и нигде не хранится. Рамки, концы линий, прокрутка с памятью и регистрация
// ресайза — useQuotedBody, как у статьи. Цитата с линией в ряду вне окна — полоска у края тела.
// Пока рендер md не загружен, в теле вместо сетки пустых рядов — строка загрузки. Ряды вне окна
// прокрутки сетка рисует разделителями суммарной высоты (TranslationGrid), поэтому высота тела до
// их отрисовки — оценка: для регистрации ресайза этого достаточно. Сжатый ход (флаг compressed) —
// столбик окошек вокруг групп цитат (useQuoteWindows.js, QuoteWindows.js): строка языков над первым
// окошком, в окошке — ряды с обеими колонками и своя прокрутка.

import { TID } from '@/config/testIds';
import { TRANSLATION_MIN_WIDTH } from '@/config/turn';
import { RULE_TURNS_CRUD } from '@/config/user';
import { WIDGET_TRANSLATION } from '@/modules/turns/settings';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { useTranslations } from 'next-intl';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import MdEditButton from '../md/MdEditButton';
import { useMdMarkVars } from '../md/MdHtml';
import { useMdRenderer } from '../md/mdRenderer';
import ParagraphQuotes from '../paragraph/ParagraphQuotes';
import { useQuotedBody } from '../useQuotedBody';
import { edgeQuotes, rowsQuoteIndex } from './quotes';
import QuoteWindows from './QuoteWindows';
import TranslationGrid, { estimateRowHeight } from './TranslationGrid';
import { useQuoteWindows } from './useQuoteWindows';

const TranslationTable = ({
  turnId,
  widgetId,
  registerHandleResize,
  unregisterHandleResize,
  widgetsUpdatedTime,
}) => {
  const t = useTranslations('Game.translation');
  const { can } = useUserContext();
  const widget = useSelector(
    (state) => state.turns.d[turnId].dWidgets[widgetId],
  );
  const { rows, languages } = widget;
  const ready = !!useMdRenderer();
  // Тело — скроллер сетки и тело для useQuotedBody; сетка монтируется только после того, как
  // элемент попал в ref: ref родителя React ставит после layout-эффектов детей, и при уже
  // загруженном рендере md хук сетки увидел бы пустой ref и отрисовал все ряды разом.
  const bodyEl = useRef(null);
  const [bodyMounted, setBodyMounted] = useState(false);
  const bindBody = useCallback((el) => {
    bodyEl.current = el;
    if (el) setBodyMounted(true);
  }, []);
  // scrollTop, выставленный сеткой при сдвиге заглушек, — не прокрутка пользователя
  const ownScroll = useRef(null);
  const markVars = useMdMarkVars();
  const view = useQuoteWindows({
    rows,
    compressed: widget.compressed,
    estimate: estimateRowHeight,
    bodyRef: bodyEl,
    ready,
  });

  // содержимое меняется с рядами и языками и один раз — когда загрузился рендер; счётчик смен
  // вместо строки всех рядов
  const changes = useRef(0);
  const version = useMemo(() => (changes.current += 1), [rows, languages]);
  const contentKey = ready ? `v${version}` : '';

  // Ряды в DOM знает сетка; цитаты остальных рядов идут записями «у края» — только те, к
  // которым подходят линии: их число не зависит от числа цитат хода.
  const quotesCount = useMemo(() => rowsQuoteIndex(rows).count, [rows]);
  const turnLines = useSelector(
    (state) => state.lines.dByTurnIdAndMarker[turnId],
  );
  const visibleRows = useRef(null);
  const [layoutKey, setLayoutKey] = useState(0);
  const onLayout = useCallback((visible) => {
    visibleRows.current = visible;
    setLayoutKey((n) => n + 1);
  }, []);
  const edge = useMemo(
    () =>
      edgeQuotes(rows, turnLines ? Object.keys(turnLines) : [], visibleRows.current),
    [rows, turnLines, layoutKey],
  );

  useQuotedBody({
    turnId,
    widgetId,
    resizeType: WIDGET_TRANSLATION,
    bodyRef: bodyEl,
    widgetsUpdatedTime,
    quotesSignature: quotesCount ? String(quotesCount) : '',
    contentKey,
    scrollPosition: widget.scrollPosition,
    registerHandleResize,
    unregisterHandleResize,
    // до загрузки рендера виджет не зарегистрирован: Turn.js ждёт его и не пересчитывает высоту
    ready: view.sizeReady,
    minWidth: TRANSLATION_MIN_WIDTH,
    ownScrollRef: ownScroll,
    edgeQuotes: edge,
    layoutKey,
    sizeKey: view.sizeKey,
    paused: view.active,
    fixedHeight: view.fixedHeight,
  });

  return (
    <>
      <div className="turn-widget stb-widget-translation" style={markVars}>
        <div
          className="translation-body"
          ref={bindBody}
          data-test-id={TID.translation.body}
          data-turn-id={turnId}
          data-compressed={view.active ? 'true' : undefined}
        >
          {ready && bodyMounted ? (
            view.active ? (
              <QuoteWindows
                view={view}
                bodyRef={bodyEl}
                turnId={turnId}
                widgetId={widgetId}
                rows={rows}
                languages={languages}
                widgetsUpdatedTime={widgetsUpdatedTime}
              />
            ) : (
              <TranslationGrid
                rows={rows}
                languages={languages}
                scrollRef={bodyEl}
                ownScrollRef={ownScroll}
                markIds
                onLayout={onLayout}
              />
            )
          ) : (
            <div
              className="translation-loading"
              data-test-id={TID.translation.loading}
            >
              {t('loading')}
            </div>
          )}
        </div>
        {can(RULE_TURNS_CRUD) && (
          <MdEditButton turnId={turnId} widgetId={widgetId} />
        )}
      </div>
      <ParagraphQuotes turnId={turnId} widgetId={widgetId} />
    </>
  );
};

export default memo(TranslationTable);
