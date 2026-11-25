// Сжатый вид статьи и перевода на карточке — столбик окошек вокруг групп цитат (windows.js,
// рисует QuoteWindows.js). Флаг хода compressed действует с двумя и более цитатами, как у абзаца.
// Раскладка окошек считается по замеру рядов с цитатами и их соседей и держится, пока не сменились
// ряды или ширина тела: высоты окошек постоянны, их сумма известна до отрисовки рядов окошек.

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { rowMarks, rowsQuoteIndex } from './quotes';
import { measuredWindows, rowsToMeasure, windowOfRow, WINDOW_MAX } from './windows';

const text = (value) => (typeof value === 'string' ? value : '');
const SEPARATOR = String.fromCharCode(0);

// Подпись рядов: раскладка зависит от числа рядов, их длин и текста рядов с выделениями. Ход,
// перечитанный без правок (кадр ведущего), даёт ту же подпись — окошки остаются как были.
const signatureOf = (rows) => {
  let length = 0;
  const marked = [];
  for (const row of rows) {
    length += text(row.left).length + text(row.right).length;
    if (rowMarks(row).length) marked.push(row.id, text(row.left), text(row.right));
  }
  return [rows.length, length, ...marked].join(SEPARATOR);
};

const quoteRowsOf = (rows) => {
  const found = [];
  for (let i = 0; i < rows.length; i += 1) {
    if (rowMarks(rows[i]).some((mark) => mark.id !== null)) found.push(i);
  }
  return found;
};

// rows — все ряды хода; single — статья; estimate(row, box) — оценка высоты ряда; bodyRef — тело
// карточки; ready — рендер md загружен. Ответ: active — сжатый вид на деле; windows — окошки
// [{ key, height, from, to, rows, always, startAt }] или null, пока раскладки нет; layoutId — номер
// раскладки; measure — что замерить сейчас ({ key, indexes, rows }) или null; onMeasured — приёмник замера;
// indexOfRow(id) — номер окошка ряда; fixedHeight — ref с высотой тела (сумма окошек и строки
// языков; null — вид не сжат); sizeKey — меняется, когда карточке пора пересчитать высоту;
// sizeReady — тело можно регистрировать для ресайза (у сжатого хода — когда есть раскладка).
export const useQuoteWindows = ({ rows, compressed, single = false, estimate, bodyRef, ready = true }) => {
  const quotes = useMemo(() => rowsQuoteIndex(rows).count, [rows]);
  const active = !!compressed && quotes > 1 && ready;
  const signature = useMemo(() => (active ? signatureOf(rows) : ''), [active, rows]);
  const [layout, setLayout] = useState(null);
  const [width, setWidth] = useState(0);
  const fixedHeight = useRef(null);
  const [sizeKey, setSizeKey] = useState(0);

  const current = active ? layout : null;
  const fresh =
    !!current &&
    current.signature === signature &&
    current.single === single &&
    (!width || current.width === width);

  const measure = useMemo(() => {
    if (!active || fresh) return null;
    const indexes = rowsToMeasure(rows.length, quoteRowsOf(rows));
    return { key: [signature, width].join(SEPARATOR), indexes, rows: indexes.map((i) => rows[i]) };
  }, [active, fresh, rows, signature, width]);

  // heights, marks — по id замеренных рядов; extra — высота того, что стоит в теле над окошками
  const onMeasured = useCallback(
    ({ box, bodyWidth, heights, marks, extra = 0 }) => {
      if (!measure) return;
      const measured = measure.indexes.map((row) => ({
        row,
        height: heights.get(rows[row].id) || 0,
        marks: marks.get(rows[row].id) || [],
      }));
      let { windows, total } = measuredWindows({
        count: rows.length,
        estimate: (i) => estimate(rows[i], box),
        measured,
      });
      // выделения есть в исходнике, но не в разметке (внутри кода) — одно окошко на весь ход
      if (!windows.length) {
        total = Math.min(WINDOW_MAX, measured.reduce((sum, item) => sum + item.height, 0) || WINDOW_MAX);
        windows = [{ from: 0, to: rows.length - 1, height: total, rows: [] }];
      }
      fixedHeight.current = total + extra;
      setWidth(bodyWidth);
      setLayout((was) => ({
        id: (was?.id || 0) + 1,
        signature,
        single,
        width: bodyWidth,
        count: rows.length,
        total: total + extra,
        windows: windows.map((item) => ({
          from: item.from,
          to: item.to,
          height: item.height,
          quoteRows: item.rows,
        })),
      }));
    },
    [measure, rows, signature, single, estimate],
  );

  // раскладка хранит номера рядов; ряды — текущие (после правки ряда новая раскладка придёт следом)
  const windows = useMemo(() => {
    if (!current || current.count !== rows.length) return null;
    return current.windows.map((item, k) => ({
      key: k,
      height: item.height,
      from: item.from,
      to: item.to,
      rows: rows.slice(item.from, item.to + 1),
      always: item.quoteRows.map((i) => rows[i].id),
      startAt: item.quoteRows.length ? rows[item.quoteRows[0]].id : undefined,
    }));
  }, [current, rows]);

  const indexOfRow = useCallback(
    (id) => {
      if (!windows) return -1;
      const index = rows.findIndex((row) => row.id === id);
      return index < 0 ? -1 : windowOfRow(windows, index);
    },
    [windows, rows],
  );

  // смена ширины тела — новый замер и раскладка
  useLayoutEffect(() => {
    const el = bodyRef?.current;
    if (!active || !el || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(() => {
      if (el.clientWidth) setWidth(el.clientWidth);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [active, bodyRef?.current]);

  // Выход из сжатого вида: внутренняя карточка держит в стиле высоту прежнего зажатия — без сброса
  // пересчёт размера прочёл бы её, а не высоту хода (у нажавшего и у спутника одинаково).
  const was = useRef(active);
  useLayoutEffect(() => {
    if (was.current === active) return;
    was.current = active;
    if (active) return;
    fixedHeight.current = null;
    setLayout(null);
    const inner = bodyRef?.current?.closest('.stb-react-turn__inner');
    if (inner) inner.style.height = '';
  }, [active]);

  // Карточка пересчитывает высоту при входе в сжатый вид, выходе и смене суммы окошек. Пока карточку
  // тянут за край, регистрация не трогается (она пересоздаёт ресайз): пересчёт — после отпускания.
  const total = current ? current.total : null;
  const sized = useRef(total);
  useLayoutEffect(() => {
    if (sized.current === total) return undefined;
    sized.current = total;
    const bump = () => setSizeKey((n) => n + 1);
    const inner = bodyRef?.current?.closest('.stb-react-turn__inner');
    if (!inner?.classList.contains('ui-resizable-resizing')) {
      bump();
      return undefined;
    }
    let raf = 0;
    const release = () => {
      raf = requestAnimationFrame(bump);
    };
    document.addEventListener('mouseup', release, { capture: true, once: true });
    return () => {
      document.removeEventListener('mouseup', release, { capture: true });
      cancelAnimationFrame(raf);
    };
  }, [total]);

  const registered = useRef(false);
  const sizeReady = ready && (!active || !!current || registered.current);
  if (sizeReady) registered.current = true;

  return {
    active,
    windows,
    layoutId: current ? current.id : 0,
    measure,
    onMeasured,
    indexOfRow,
    fixedHeight,
    sizeKey,
    sizeReady,
  };
};
