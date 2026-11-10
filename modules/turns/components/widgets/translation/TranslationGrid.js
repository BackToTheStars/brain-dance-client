// Сетка перевода без стора: строка языков (если хоть один задан) и ряды по две ячейки md без id
// выделений. На ней стоят карточка (TranslationTable) и предпросмотр формы (TranslationEditor).
// Ячейки md рисуются только у рядов в окне прокрутки с запасом; ряды вне окна подряд — один пустой
// разделитель (data-spacer) суммарной высоты их оценок, а после первой отрисовки — замеров, чтобы
// длинный ход не верстал невидимое и число элементов не зависело от числа рядов. scrollRef —
// скроллер сетки; ownScrollRef — см. useVisibleParts.

import { TID } from '@/config/testIds';
import { memo, useCallback, useMemo } from 'react';
import MdHtml from '../md/MdHtml';
import { estimateTextHeight, runs, sumHeights } from '../parts/layout';
import { useVisibleParts } from '../parts/useVisibleParts';

const text = (value) => (typeof value === 'string' ? value : '');

// Оценка высоты ряда до отрисовки: строк по большей ячейке при средней ширине знака в половину
// кегля и колонке без отступов ячейки (0,5em с боков), плюс отступы ячейки по вертикали (0,3em
// сверху и снизу) и рамка ряда. Систематическую ошибку снимает калибровка хука.
export const estimateRowHeight = (row, box) =>
  estimateTextHeight({
    chars: Math.max(text(row?.left).length, text(row?.right).length),
    columnWidth: box.width / 2 - box.fontSize,
    charWidth: box.fontSize * 0.5,
    lineHeight: box.lineHeight,
    extra: box.fontSize * 0.6 + 1,
  });

const TranslationGrid = ({ rows, languages, scrollRef, ownScrollRef }) => {
  const showLanguages = !!(languages?.left || languages?.right);
  const ids = useMemo(() => rows.map((row) => row.id), [rows]);
  const byId = useMemo(() => new Map(rows.map((row) => [row.id, row])), [rows]);
  const estimate = useCallback((id, box) => estimateRowHeight(byId.get(id), box), [byId]);
  const { visible, heightOf, measureRef } = useVisibleParts({
    scrollRef,
    ids,
    estimate,
    ownScrollRef,
  });
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
            className="translation-row"
            key={`spacer\u0000${run.ids[0]}`}
            data-test-id={TID.translation.row}
            data-spacer="true"
            data-from={run.ids[0]}
            data-to={run.ids[run.ids.length - 1]}
            data-count={run.ids.length}
            style={{ height: sumHeights(run.ids, heightOf) }}
          />
        ) : (
          run.ids.map((id) => {
            const row = byId.get(id);
            return (
              <div
                className="translation-row"
                key={id}
                ref={measureRef(id)}
                data-test-id={TID.translation.row}
                data-row-id={id}
              >
                <MdHtml
                  source={row.left}
                  markIds={false}
                  className="translation-cell"
                  data-test-id={TID.translation.cell}
                  data-side="left"
                />
                <MdHtml
                  source={row.right}
                  markIds={false}
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
