// Статья хода md: блоки — ряды одной колонкой (left), сплошным текстом в одном прокручиваемом теле,
// на той же сетке, что перевод (TranslationGrid в режиме single): рисуются только блоки в окне
// прокрутки с запасом, остальные — разделители суммарной высоты. Цитаты — выделения ==…==^id в
// блоках; список выводится из рядов (translation/quotes.js) и нигде не хранится. Рамки, концы линий,
// прокрутка с памятью и регистрация ресайза — useQuotedBody, как у абзаца и перевода; цитата с линией
// в блоке вне окна — полоска у края тела. Статья без рядов (ещё не разделённый markdown) делится на
// блоки здесь же, на лету, тем же делением, что на сервере.

import { TID } from '@/config/testIds';
import { RULE_TURNS_CRUD } from '@/config/user';
import { WIDGET_MD } from '@/modules/turns/settings';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import ParagraphQuotes from '../paragraph/ParagraphQuotes';
import { edgeQuotes, rowsQuoteIndex } from '../translation/quotes';
import { rowsFromMarkdown } from '../translation/rows';
import TranslationGrid from '../translation/TranslationGrid';
import { useQuotedBody } from '../useQuotedBody';
import MdEditButton from './MdEditButton';
import { useMdMarkVars } from './MdHtml';
import { useMdRenderer } from './mdRenderer';

const NO_ROWS = [];

const MdArticle = ({
  turnId,
  widgetId,
  registerHandleResize,
  unregisterHandleResize,
  widgetsUpdatedTime,
}) => {
  const { can } = useUserContext();
  const widget = useSelector(
    (state) => state.turns.d[turnId].dWidgets[widgetId],
  );
  const renderer = useMdRenderer();
  const ready = !!renderer;
  // id блоков статьи без рядов — по номеру: нужны только карточке, форма даст свои при записи
  const rows = useMemo(() => {
    if (widget.rows?.length) return widget.rows;
    if (!renderer || !widget.source?.trim()) return NO_ROWS;
    let n = 0;
    return rowsFromMarkdown(widget.source, renderer.markdownIt, () => `block-${(n += 1)}`);
  }, [widget.rows, widget.source, renderer]);

  // Тело монтирует сетку только после привязки ref: ref родителя React ставит после
  // layout-эффектов детей, и хук сетки иначе увидел бы пустой ref и отрисовал все блоки.
  const bodyEl = useRef(null);
  const [bodyMounted, setBodyMounted] = useState(false);
  const bindBody = useCallback((el) => {
    bodyEl.current = el;
    if (el) setBodyMounted(true);
  }, []);
  const ownScroll = useRef(null);
  const markVars = useMdMarkVars();

  const changes = useRef(0);
  const version = useMemo(() => (changes.current += 1), [rows]);
  const contentKey = ready ? `v${version}` : '';

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
    resizeType: WIDGET_MD,
    bodyRef: bodyEl,
    widgetsUpdatedTime,
    quotesSignature: quotesCount ? String(quotesCount) : '',
    contentKey,
    scrollPosition: widget.scrollPosition,
    registerHandleResize,
    unregisterHandleResize,
    // до загрузки рендера виджет не зарегистрирован: Turn.js ждёт его и не пересчитывает высоту
    ready,
    ownScrollRef: ownScroll,
    edgeQuotes: edge,
    layoutKey,
  });

  return (
    <>
      <div className="turn-widget stb-widget-md" style={markVars}>
        <div
          className="md-body"
          ref={bindBody}
          data-test-id={TID.md.body}
          data-turn-id={turnId}
        >
          {ready && bodyMounted && (
            <TranslationGrid
              rows={rows}
              scrollRef={bodyEl}
              ownScrollRef={ownScroll}
              markIds
              single
              onLayout={onLayout}
            />
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

export default memo(MdArticle);
