// Сетка перевода без стора: строка языков (если хоть один задан) и ряды по две ячейки md. На ней
// стоят карточка (TranslationTable; markIds — выделения с id, это цитаты) и предпросмотр формы
// (TranslationEditor; showQuoteIds — ^id выделений верхним индексом). onLayout(visible) — после отрисовки, когда сменился
// набор отрисованных рядов или их раскладка.
// single — статья md: ряд — блок статьи (только left), без языков, сетки и линий между рядами;
// блоки идут сплошным текстом. refs — определения ссылок статьи ([x]: url), общие для всех блоков:
// у блока, рисуемого отдельно, своих определений нет.
// Ячейки md рисуются только у рядов в окне прокрутки с запасом; ряды вне окна подряд — один пустой
// разделитель (data-spacer) суммарной высоты их оценок, а после первой отрисовки — замеров, чтобы
// длинный ход не верстал невидимое и число элементов не зависело от числа рядов. scrollRef —
// скроллер сетки; ownScrollRef — см. useVisibleParts.
// Сжатый ход (windows.js): rows — окошки вокруг цитат, windows — пометить их (тест-id окошка,
// data-row-id — ряд, из которого окошко); revealPart(id) — для перехода к части не из списка: true, если
// карточка покажет ход целиком; refRows — все ряды статьи: определение ссылки может стоять вне окошек.

import { TID } from '@/config/testIds';
import { memo, useCallback, useLayoutEffect, useMemo } from 'react';
import MdHtml from '../md/MdHtml';
import { estimateTextHeight, runs, sumHeights } from '../parts/layout';
import { useVisibleParts } from '../parts/useVisibleParts';

const text = (value) => (typeof value === 'string' ? value : '');

// Оценка высоты ряда до отрисовки: строк по большей ячейке при средней ширине знака в половину
// кегля и колонке без отступа ячейки к соседней колонке (0,5em), плюс отступы ячейки по вертикали
// (0,3em сверху и снизу) и рамка ряда. Систематическую ошибку снимает калибровка хука.
export const estimateRowHeight = (row, box) =>
  estimateTextHeight({
    chars: Math.max(text(row?.left).length, text(row?.right).length),
    columnWidth: box.width / 2 - box.fontSize * 0.5,
    charWidth: box.fontSize * 0.5,
    lineHeight: box.lineHeight,
    extra: box.fontSize * 0.6 + 1,
  });

// Блок статьи: колонка во всю ширину, сверху отступ между блоками (0,6em).
export const estimateBlockHeight = (row, box) =>
  estimateTextHeight({
    chars: text(row?.left).length,
    columnWidth: box.width,
    charWidth: box.fontSize * 0.5,
    lineHeight: box.lineHeight,
    extra: box.fontSize * 0.6,
  });

// Определения ссылок статьи: блоки, у которых каждая строка — определение.
const DEFINITION = /^ {0,3}\[[^\]]+\]:\s*\S/;
export const linkDefinitions = (rows) => {
  const found = [];
  for (const row of rows) {
    const source = text(row?.left);
    if (!source.includes(']:')) continue;
    const lines = source.split('\n');
    if (lines.every((line) => DEFINITION.test(line))) found.push(source);
  }
  return found.join('\n');
};

const withRefs = (source, refs) => (refs && source.includes('[') ? `${source}\n\n${refs}` : source);

const TranslationGrid = ({
  rows,
  languages,
  scrollRef,
  ownScrollRef,
  markIds = false,
  showQuoteIds = false,
  onLayout,
  single = false,
  windows = false,
  revealPart,
  refRows,
}) => {
  const showLanguages = !single && !!(languages?.left || languages?.right);
  const ids = useMemo(() => rows.map((row) => row.id), [rows]);
  const byId = useMemo(() => new Map(rows.map((row) => [row.id, row])), [rows]);
  const refs = useMemo(
    () => (single ? linkDefinitions(refRows || rows) : ''),
    [single, rows, refRows],
  );
  const estimate = useCallback(
    (id, box) => (single ? estimateBlockHeight : estimateRowHeight)(byId.get(id), box),
    [byId, single],
  );
  const parts = useVisibleParts({
    scrollRef,
    ids,
    estimate,
    ownScrollRef,
    layoutKey: single ? 'single' : undefined,
    reveal: revealPart,
  });
  const { visible, heightOf, measureRef } = parts;
  useLayoutEffect(() => {
    onLayout?.(visible);
  }, [parts]);
  const rowClass = single ? 'md-block' : 'translation-row';
  const rowTestId = single ? TID.md.block : TID.translation.row;
  const partClass = windows ? `${rowClass} turn-compressed-window` : rowClass;
  const partTestId = windows ? TID.turnCompressedWindow : rowTestId;
  return (
    <>
      {showLanguages && (
        <div
          className="translation-languages"
          data-test-id={TID.translation.languages}
        >
          <div className="translation-cell" data-side="left">
            {languages.left}
          </div>
          <div className="translation-cell" data-side="right">
            {languages.right}
          </div>
        </div>
      )}
      {/* один плоский список с ключами: ряд, оставшийся в окне, не перемонтируется при смене отрезков */}
      {runs(ids, visible).flatMap((run) =>
        !run.visible ? (
          <div
            className={rowClass}
            key={`spacer\u0000${run.ids[0]}`}
            data-test-id={rowTestId}
            data-spacer="true"
            data-from={run.ids[0]}
            data-to={run.ids[run.ids.length - 1]}
            data-count={run.ids.length}
            style={{ height: sumHeights(run.ids, heightOf) }}
          />
        ) : (
          run.ids.map((id) => {
            const row = byId.get(id);
            const rowId = windows ? row.rowId : id;
            return single ? (
              <MdHtml
                key={id}
                bodyRef={measureRef(id)}
                source={withRefs(row.left, refs)}
                markIds={markIds}
                showQuoteIds={showQuoteIds}
                className={partClass}
                data-test-id={partTestId}
                data-row-id={rowId}
              />
            ) : (
              <div
                className={partClass}
                key={id}
                ref={measureRef(id)}
                data-test-id={partTestId}
                data-row-id={rowId}
              >
                <MdHtml
                  source={row.left}
                  markIds={markIds}
                  showQuoteIds={showQuoteIds}
                  className="translation-cell"
                  data-test-id={TID.translation.cell}
                  data-side="left"
                />
                <MdHtml
                  source={row.right}
                  markIds={markIds}
                  showQuoteIds={showQuoteIds}
                  className="translation-cell"
                  data-test-id={TID.translation.cell}
                  data-side="right"
                />
              </div>
            );
          })
        ),
      )}
    </>
  );
};

export default memo(TranslationGrid);
