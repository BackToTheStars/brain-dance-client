// Столбик окошек сжатой статьи и перевода (раскладка — useQuoteWindows.js). Окошко — скроллер
// постоянной высоты со своей ленивой сеткой рядов (TranslationGrid на скроллере окошка); ряды с
// цитатами рисуются всегда. Окошко держит свою группу цитат по центру, пока его не прокрутили, само
// меряет рамки своих цитат и режет их по своему краю; записи всех окошек уходят в стор одним действием.
// Тело карточки не прокручивается; переход к ряду (навигатор) тело отдаёт окошку этого ряда.
// Перед раскладкой нужные ряды рисуются невидимо и меряются (Measure) — в том же кадре.

import { TID } from '@/config/testIds';
import { quoteCoordsUpdate } from '@/modules/lines/redux/actions';
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useStore } from 'react-redux';
import { getParagraphQuotesWithoutScroll, getWindowQuotes } from '../../helpers/quotesHelper';
import { partsOf, readBox, registerParts } from '../parts/useVisibleParts';
import TranslationGrid, { gridRow, languagesRow, linkDefinitions } from './TranslationGrid';

const MARKS = '[data-id]:not([data-id=""])';
// getParagraphQuotesWithoutScroll кладёт верх рамки на 2 px ниже верха выделения
const FRAME_SHIFT = 2;

// Высоты рядов и места выделений (от верха своего ряда) в px холста: тело может стоять под CSS zoom.
const readRows = (root) => {
  const heights = new Map();
  const marks = new Map();
  for (const row of root.querySelectorAll(':scope > [data-row-id]')) {
    const box = row.getBoundingClientRect();
    const scale = box.height && row.offsetHeight ? row.offsetHeight / box.height : 1;
    heights.set(row.dataset.rowId, row.offsetHeight);
    marks.set(
      row.dataset.rowId,
      [...row.querySelectorAll(MARKS)].map((mark) => {
        const rect = mark.getBoundingClientRect();
        return {
          id: mark.getAttribute('data-id'),
          top: (rect.top - box.top) * scale,
          bottom: (rect.bottom - box.top) * scale,
        };
      }),
    );
  }
  return { heights, marks };
};

// Замер: коробка как у окошка (те же отступы и полоса прокрутки). lead — перед первым рядом стоит
// пустой: у ряда не из начала хода тот же отступ между рядами, что у остальных.
const Measure = ({ rows, lead, single, refs, onMeasured }) => {
  const el = useRef(null);
  useLayoutEffect(() => {
    onMeasured({ box: readBox(el.current), ...readRows(el.current) });
  }, []);
  return (
    <div className="turn-compressed-window turn-compressed-window_measure" aria-hidden="true" ref={el}>
      {lead && <div className={single ? 'md-block' : 'translation-row'} />}
      {rows.map((row) => gridRow(row, { single, refs, markIds: true, showQuoteIds: false }))}
    </div>
  );
};

const QuoteWindow = memo(
  ({ index, item, layoutId, single, md, definitions, turnId, report, register, widgetsUpdatedTime }) => {
    const el = useRef(null);
    const [mounted, setMounted] = useState(false);
    const bind = useCallback((node) => {
      el.current = node;
      if (node) setMounted(true);
    }, []);
    const store = useStore();
    // scrollTop, выставленный окошком или его сеткой, — не прокрутка пользователя
    const own = useRef(null);
    const pinned = useRef(true);

    const measure = useCallback(() => {
      const node = el.current;
      if (!node) return;
      const zoom = store.getState().game.zoom;
      const quotes = getParagraphQuotesWithoutScroll(turnId, el, zoom);
      if (pinned.current && quotes.length) {
        let top = Infinity;
        let bottom = -Infinity;
        for (const { initialCoords } of quotes) {
          top = Math.min(top, initialCoords.top);
          bottom = Math.max(bottom, initialCoords.top + initialCoords.height);
        }
        const centre = (top + bottom) / 2 - FRAME_SHIFT;
        const target = Math.max(
          0,
          Math.min(node.scrollHeight - node.clientHeight, Math.round(centre - node.clientHeight / 2)),
        );
        const before = node.scrollTop;
        if (Math.abs(before - target) >= 1) {
          node.scrollTop = target;
          if (node.scrollTop !== before) own.current = Math.round(node.scrollTop);
        }
      }
      report(index, getWindowQuotes(quotes, node, node.closest('.stb-react-turn__inner'), zoom));
    }, [turnId, index, report]);

    useLayoutEffect(() => {
      register(index, {
        el,
        unpin: () => {
          pinned.current = false;
        },
      });
      return () => register(index, null);
    }, [index, register]);

    // новая раскладка — группа снова по центру
    useLayoutEffect(() => {
      pinned.current = true;
    }, [layoutId]);

    // окошко сдвигают и высоты окошек выше, и виджеты карточки над телом
    useLayoutEffect(() => {
      if (mounted) measure();
    }, [mounted, layoutId, item.height, widgetsUpdatedTime, measure]);

    useEffect(() => {
      const node = el.current;
      if (!node) return undefined;
      const onScroll = () => {
        const top = Math.round(node.scrollTop);
        if (own.current !== null && Math.abs(top - own.current) <= 1) own.current = null;
        else pinned.current = false;
        measure();
      };
      node.addEventListener('scroll', onScroll, { passive: true });
      return () => node.removeEventListener('scroll', onScroll);
    }, [mounted, measure]);

    return (
      <div
        className="turn-compressed-window"
        ref={bind}
        data-test-id={TID.turnCompressedWindow}
        data-index={index}
        data-rows={item.rows.length}
        data-first-row={item.rows[0]?.id}
        data-last-row={item.rows[item.rows.length - 1]?.id}
        style={{ height: item.height }}
      >
        {mounted && (
          <TranslationGrid
            rows={item.rows}
            scrollRef={el}
            ownScrollRef={own}
            markIds
            single={single}
            md={md}
            definitions={single ? definitions : undefined}
            always={item.always}
            startAt={item.startAt}
            onLayout={measure}
            onMeasure={measure}
          />
        )}
      </div>
    );
  },
);

// view — ответ useQuoteWindows; bodyRef — тело карточки; rows — все ряды хода; md — экземпляр
// markdown-it рендера (определения ссылок статьи); widgetsUpdatedTime — виджеты карточки сменились.
const QuoteWindows = ({
  view,
  bodyRef,
  turnId,
  widgetId,
  rows,
  languages,
  single = false,
  md,
  widgetsUpdatedTime,
}) => {
  const dispatch = useDispatch();
  const definitions = useMemo(() => (single ? linkDefinitions(rows, md) : ''), [single, rows, md]);
  const showLanguages = !single && !!(languages?.left || languages?.right);

  // Записи рамок по окошкам: в стор — когда отчитались все окошки раскладки, раз на задачу.
  const records = useRef({ layoutId: 0, lists: [] });
  if (records.current.layoutId !== view.layoutId) records.current = { layoutId: view.layoutId, lists: [] };
  const count = useRef(0);
  count.current = view.windows ? view.windows.length : 0;
  const alive = useRef(true);
  const queued = useRef(false);
  const report = useCallback(
    (index, list) => {
      records.current.lists[index] = list;
      if (queued.current) return;
      queued.current = true;
      queueMicrotask(() => {
        queued.current = false;
        if (!alive.current) return;
        const all = [];
        for (let k = 0; k < count.current; k += 1) {
          const list = records.current.lists[k];
          if (!list) return;
          all.push(...list);
        }
        dispatch(quoteCoordsUpdate(turnId, widgetId, all));
      });
    },
    [turnId, widgetId],
  );
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  // Переход к ряду: тело находит окошко ряда, окошко перестаёт держать группу по центру.
  const windows = useRef([]);
  const register = useCallback((index, api) => {
    windows.current[index] = api;
  }, []);
  const indexOfRow = useRef(view.indexOfRow);
  indexOfRow.current = view.indexOfRow;
  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body) return undefined;
    return registerParts(body, {
      scrollToPart: (id) => {
        const api = windows.current[indexOfRow.current(id)];
        const parts = api && partsOf(api.el.current);
        if (!parts) return Promise.resolve(null);
        api.unpin();
        return parts.scrollToPart(id);
      },
    });
  }, []);

  const onMeasured = (data) => {
    const body = bodyRef.current;
    view.onMeasured({
      ...data,
      bodyWidth: body.clientWidth,
      extra: body.querySelector(':scope > .turn-compressed-languages')?.offsetHeight || 0,
    });
  };

  return (
    <>
      {showLanguages && <div className="turn-compressed-languages">{languagesRow(languages)}</div>}
      {view.windows?.map((item) => (
        <QuoteWindow
          key={item.key}
          index={item.key}
          item={item}
          layoutId={view.layoutId}
          single={single}
          md={md}
          definitions={definitions}
          turnId={turnId}
          report={report}
          register={register}
          widgetsUpdatedTime={widgetsUpdatedTime}
        />
      ))}
      {view.measure && (
        <Measure
          key={view.measure.key}
          rows={view.measure.rows}
          lead={view.measure.indexes[0] !== 0}
          single={single}
          refs={definitions}
          onMeasured={onMeasured}
        />
      )}
    </>
  );
};

export default memo(QuoteWindows);
