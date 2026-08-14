// Виджет simple PDF (задачи 4.1 и 4.2): просмотр страниц со скроллом внутри
// карточки хода, запоминание позиции скролла и прямоугольные цитаты.
//
// Цитаты (4.2) хранятся в координатах документа: номер страницы + проценты от
// её бокса, цитата не пересекает границу страниц. Пересчёт в координаты
// карточки и клампинг по видимости — в quotesGeometry.js, рисование рамок —
// в Quotes.js (общий слой цитат, как у текстовых), выделение области —
// в Crop.js на активной странице.
//
// Скролл хранится в том же канале, что и у параграфа: TURNS_SCROLL пишет в
// turns.scrollPositions, персист — по кнопке Save Field (game-redux/actions.js
// saveField → updateScrollPositionsRequest → Turn.scrollPosition на сервере).
// Поле scrollPosition одно на ход, но у pdf-хода нет скроллящегося параграфа,
// поэтому конфликта нет.
//
// Страницы рисуются лениво: placeholder'ы с правильной высотой создаются сразу
// (из соотношения сторон страницы), а canvas заполняется, когда страница
// попадает в область видимости. Благодаря этому scrollHeight корректен до
// отрисовки — позиция скролла восстанавливается сразу после загрузки документа.

import {
  MODE_WIDGET_PDF,
  MODE_WIDGET_PDF_QUOTE_ACTIVE,
  MODE_WIDGET_PDF_QUOTE_ADD,
} from '@/config/panel';
import { TID } from '@/config/testIds';
import { TURN_SIZE_MIN_WIDTH } from '@/config/turn';
import {
  PDF_PAGE_GAP,
  PDF_QUOTES_TIMEOUT_DELAY,
  PDF_RERENDER_TIMEOUT_DELAY,
  PDF_SCROLL_TIMEOUT_DELAY,
  widgetSpacer,
} from '@/config/ui';
import { RULE_TURNS_CRUD } from '@/config/user';
import { quoteCoordsUpdate } from '@/modules/lines/redux/actions';
import { changeWidgetParams } from '@/modules/panels/redux/actions';
import { updateScrollPosition } from '@/modules/turns/redux/actions';
import { WIDGET_PDF } from '@/modules/turns/settings';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getQueue } from '../../helpers/queueHelper';
import WidgetEditButton from '../buttons/Edit';
import PdfCrop from './Crop';
import PageBar from './PageBar';
import { getDocumentParams, loadPdfjs } from './pdfLoader';
import PdfQuotes from './Quotes';
import { getPageOffsets, getPdfQuotesWithCoords } from './quotesGeometry';

const MAX_PIXEL_RATIO = 2; // выше — только расход памяти на canvas
const PDF_WIDGET_MIN_HEIGHT = 60;
const PDF_UNBOUNDED_HEIGHT = 100000; // пока документ не загружен, высоту не ограничиваем
const RENDER_MARGIN = '300px 0px'; // насколько заранее рисуем страницы за границей вьюпорта
const EDIT_MODES = [
  MODE_WIDGET_PDF,
  MODE_WIDGET_PDF_QUOTE_ADD,
  MODE_WIDGET_PDF_QUOTE_ACTIVE,
];

const Pdf = ({
  turnId,
  widgetId,
  registerHandleResize,
  unregisterHandleResize,
}) => {
  const url = useSelector(
    (state) => state.turns.d[turnId].dWidgets[widgetId]?.url,
  );
  const storedScrollPosition = useSelector(
    (state) => state.turns.d[turnId].dWidgets[widgetId]?.scrollPosition || 0,
  );
  const quotes = useSelector(
    (state) => state.turns.d[turnId].dWidgets[widgetId]?.quotes,
  );
  const turnSize = useSelector((state) => state.turns.g[turnId].size);
  const mode = useSelector((state) => state.panels.mode);
  const editTurnId = useSelector((state) => state.panels.editTurnId);
  const editWidgetId = useSelector((state) => state.panels.editWidgetId);
  const widgetKey = `${turnId}_${widgetId}`;
  const editWidgetParams = useSelector(
    (state) => state.panels.editWidgetParams[widgetKey],
  );
  const { can } = useUserContext();
  const dispatch = useDispatch();

  const isWidgetEdited =
    editTurnId === turnId && editWidgetId === widgetId && EDIT_MODES.includes(mode);
  const activeQuoteId = isWidgetEdited ? editWidgetParams?.activeQuoteId : null;

  const scrollEl = useRef(null);
  const docRef = useRef(null);
  const pageElsRef = useRef(new Map()); // номер страницы -> DOM-узел обёртки
  const renderedRef = useRef(new Map()); // номер страницы -> ширина, на которой отрисовали
  const renderingRef = useRef(new Map()); // номер страницы -> ширина текущего прохода
  const renderTasksRef = useRef(new Map());
  const generationsRef = useRef(new Map()); // номер страницы -> номер прохода отрисовки
  const visibleRef = useRef(new Set());
  const aspectsRef = useRef([]); // соотношения height/width страниц
  const pageWidthRef = useRef(0);
  const appliedScrollRef = useRef(null);

  const scrollQueue = useRef(getQueue(PDF_SCROLL_TIMEOUT_DELAY)).current;
  const rerenderQueue = useRef(getQueue(PDF_RERENDER_TIMEOUT_DELAY)).current;
  const quotesQueue = useRef(getQueue(PDF_QUOTES_TIMEOUT_DELAY)).current;

  const [pages, setPages] = useState([]); // [{ number, aspect }]
  const [pageWidth, setPageWidth] = useState(0);
  const [error, setError] = useState(null);
  const [activePage, setActivePage] = useState(1);
  // отдельный стейт для быстрого пересчёта цитат; ведётся только когда цитаты
  // есть, иначе прокрутка не должна дёргать ререндер виджета
  const [scrollTop, setScrollTop] = useState(0);

  const hasQuotes = !!quotes?.length;

  // смещения страниц в системе координат прокручиваемого контента
  const pageOffsets = useMemo(
    () => getPageOffsets(pages, pageWidth, PDF_PAGE_GAP),
    [pages, pageWidth],
  );
  // обработчик скролла вешается один раз — свежие значения он берёт из ref'ов
  const pageOffsetsRef = useRef([]);
  pageOffsetsRef.current = pageOffsets;
  const hasQuotesRef = useRef(false);
  hasQuotesRef.current = hasQuotes;

  const goToPage = (page) => {
    const el = scrollEl.current;
    const offset = pageOffsetsRef.current[page - 1];
    if (!el || !offset) return;
    el.scrollTop = offset.top;
    setActivePage(page);
  };

  const cancelRenderTasks = () => {
    for (const task of renderTasksRef.current.values()) {
      task.cancel();
    }
    renderTasksRef.current.clear();
    renderingRef.current.clear();
  };

  const renderPage = async (number) => {
    const doc = docRef.current;
    const width = pageWidthRef.current;
    if (!doc || !width) return;
    if (renderedRef.current.get(number) === width) return;

    // страница уже рисуется: на той же ширине — ждём, на другой (ресайз во время
    // отрисовки) — вытесняем старый проход, иначе он бы «залип» в старом разрешении
    const pendingWidth = renderingRef.current.get(number);
    if (pendingWidth === width) return;
    if (pendingWidth !== undefined) {
      renderTasksRef.current.get(number)?.cancel();
    }

    const canvas = pageElsRef.current.get(number)?.querySelector('canvas');
    if (!canvas) return;

    // поколение: два прохода не должны рисовать в один canvas одновременно
    const generation = (generationsRef.current.get(number) || 0) + 1;
    generationsRef.current.set(number, generation);
    renderingRef.current.set(number, width);
    const isCurrent = () =>
      docRef.current === doc && generationsRef.current.get(number) === generation;

    try {
      const page = await doc.getPage(number);
      if (!isCurrent()) return;
      const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({
        scale: (width * ratio) / base.width,
      });
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const task = page.render({
        canvasContext: canvas.getContext('2d'),
        viewport,
      });
      renderTasksRef.current.set(number, task);
      await task.promise;
      if (!isCurrent()) return;
      renderedRef.current.set(number, width);
    } catch (err) {
      // отменённый рендер — штатная ситуация (ресайз/размонтирование)
      if (err?.name !== 'RenderingCancelledException') {
        console.error('[pdf] не удалось отрисовать страницу', number, err);
      }
    } finally {
      // если нас вытеснил более свежий проход — не трогаем его состояние
      if (generationsRef.current.get(number) === generation) {
        renderingRef.current.delete(number);
        renderTasksRef.current.delete(number);
      }
    }
  };

  const renderVisiblePages = () => {
    for (const number of visibleRef.current) {
      renderPage(number);
    }
  };

  // ЗАГРУЗКА ДОКУМЕНТА
  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    let loadingTask = null;

    setError(null);
    setPages([]);
    renderedRef.current.clear();
    visibleRef.current.clear();
    pageElsRef.current.clear();
    appliedScrollRef.current = null;
    aspectsRef.current = [];

    loadPdfjs()
      .then(async (pdfjs) => {
        loadingTask = pdfjs.getDocument(getDocumentParams(url));
        const doc = await loadingTask.promise;
        // ресурсы освобождает cleanup эффекта через loadingTask.destroy()
        if (cancelled) return;
        docRef.current = doc;

        // размеры всех страниц нужны сразу: из них строятся placeholder'ы,
        // а значит и корректная высота скролла до отрисовки
        const nextPages = [];
        for (let number = 1; number <= doc.numPages; number += 1) {
          const page = await doc.getPage(number);
          if (cancelled) return;
          const viewport = page.getViewport({ scale: 1 });
          nextPages.push({
            number,
            aspect: viewport.height / viewport.width,
          });
        }
        aspectsRef.current = nextPages.map((page) => page.aspect);
        setPages(nextPages);
      })
      .catch((err) => {
        if (cancelled) return;
        setError({
          message: err?.message || String(err),
          // самая частая причина для внешней ссылки — чужой хост не отдаёт
          // Access-Control-Allow-Origin, и запрос не доходит до pdf.js
          isNetwork: err?.name === 'UnknownErrorException' ||
            /fetch|network|CORS/i.test(err?.message || ''),
        });
      });

    return () => {
      cancelled = true;
      cancelRenderTasks();
      docRef.current = null;
      // У PDFDocumentProxy в pdfjs 6 нет destroy() — освобождает ресурсы (и закрывает
      // воркер документа) только задача загрузки. Вызов doc.destroy() здесь ронял
      // приложение при удалении pdf-хода: исключение в cleanup эффекта размонтирует
      // всё дерево — «This page couldn't load».
      // destroy() отклоняется, если задача ещё выполняется, — это ожидаемо.
      if (loadingTask) loadingTask.destroy().catch(() => {});
    };
  }, [url]);

  // ШИРИНА: следим только за ней, высота приходит от ресайза карточки
  useEffect(() => {
    const el = scrollEl.current;
    if (!el) return;
    const measure = () => {
      const next = el.clientWidth;
      setPageWidth((prev) => (prev === next ? prev : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    pageWidthRef.current = pageWidth;
    if (!pageWidth || !pages.length) return;
    // renderPage сам пропустит страницы, отрисованные на этой же ширине
    rerenderQueue.add(renderVisiblePages);
  }, [pageWidth, pages]);

  // ЛЕНИВАЯ ОТРИСОВКА ВИДИМЫХ СТРАНИЦ
  useEffect(() => {
    const root = scrollEl.current;
    if (!root || !pages.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const number = Number(entry.target.dataset.pageNumber);
          if (entry.isIntersecting) {
            visibleRef.current.add(number);
            renderPage(number);
          } else {
            visibleRef.current.delete(number);
          }
        }
      },
      { root, rootMargin: RENDER_MARGIN },
    );

    for (const node of pageElsRef.current.values()) {
      observer.observe(node);
    }
    return () => observer.disconnect();
  }, [pages]);

  // ВОССТАНОВЛЕНИЕ СКРОЛЛА
  // Применяем каждое новое значение из стора ровно один раз, иначе ресайз
  // карточки (меняется pageWidth) откидывал бы пользователя назад.
  useEffect(() => {
    const el = scrollEl.current;
    if (!el || !pages.length || !pageWidth) return;
    if (appliedScrollRef.current === storedScrollPosition) return;
    el.scrollTop = storedScrollPosition;
    appliedScrollRef.current = storedScrollPosition;
  }, [storedScrollPosition, pages.length, pageWidth]);

  // ЗАПОМИНАНИЕ СКРОЛЛА + АКТИВНАЯ СТРАНИЦА
  useEffect(() => {
    const el = scrollEl.current;
    if (!el) return;
    const scrollHandler = () => {
      if (!scrollEl.current) return;
      const currentScrollTop = scrollEl.current.scrollTop;

      // активная страница — та, что занимает больше всего видимой области
      const offsets = pageOffsetsRef.current;
      if (offsets.length) {
        const windowTop = currentScrollTop;
        const windowBottom = currentScrollTop + scrollEl.current.clientHeight;
        let bestPage = 1;
        let bestVisible = -1;
        for (let index = 0; index < offsets.length; index += 1) {
          const { top, height } = offsets[index];
          if (top >= windowBottom) break; // дальше только страницы ниже вьюпорта
          const visible =
            Math.min(top + height, windowBottom) - Math.max(top, windowTop);
          if (visible > bestVisible) {
            bestVisible = visible;
            bestPage = index + 1;
          }
        }
        setActivePage((prev) => (prev === bestPage ? prev : bestPage));
      }

      if (hasQuotesRef.current) {
        setScrollTop(currentScrollTop);
      }

      scrollQueue.add(() => {
        if (!scrollEl.current) return;
        const scrollPosition = Math.floor(scrollEl.current.scrollTop);
        appliedScrollRef.current = scrollPosition;
        dispatch(
          updateScrollPosition({ turnId, widgetId, scrollPosition }),
        );
      });
    };
    el.addEventListener('scroll', scrollHandler);
    return () => el.removeEventListener('scroll', scrollHandler);
  }, [turnId, widgetId]);

  // Пока цитат нет, прокрутка не пишется в scrollTop (лишние ререндеры), поэтому
  // в момент появления первой цитаты состояние надо подтянуть из DOM — иначе
  // следующая прокрутка может «совпасть» со старым значением и не запустить
  // пересчёт геометрии.
  useEffect(() => {
    if (!hasQuotes || !scrollEl.current) return;
    setScrollTop(scrollEl.current.scrollTop);
  }, [hasQuotes]);

  // ЦИТАТЫ: пересчёт координат в систему карточки (из него же берутся якоря линий)
  useEffect(() => {
    const el = scrollEl.current;
    if (!el || !pageOffsets.length) return;
    const turnEl = el.closest('.stb-react-turn');
    if (!turnEl) return;

    const rect = el.getBoundingClientRect();
    const turnRect = turnEl.getBoundingClientRect();
    const withCoords = getPdfQuotesWithCoords({
      quotes: quotes || [],
      pageOffsets,
      pageWidth,
      scrollTop: el.scrollTop,
      viewportWidth: el.clientWidth,
      viewportHeight: el.clientHeight,
      widgetLeft: Math.round(rect.left - turnRect.left),
      widgetTop: Math.round(rect.top - turnRect.top),
      turnId,
    });

    quotesQueue.add(() => {
      dispatch(quoteCoordsUpdate(turnId, widgetId, withCoords));
    });
  }, [
    quotes,
    pageOffsets,
    pageWidth,
    scrollTop,
    turnSize.width,
    turnSize.height,
  ]);

  // активная страница нужна панели кнопок: цитата добавляется именно к ней.
  // В режимах правки страницу не трогаем — она зафиксирована выделением/цитатой.
  useEffect(() => {
    if (!isWidgetEdited || mode !== MODE_WIDGET_PDF) return;
    if (editWidgetParams?.activePage === activePage) return;
    dispatch(changeWidgetParams({ widgetKey, params: { activePage } }));
  }, [isWidgetEdited, mode, activePage]);

  // выбрали цитату на другой странице — доводим её до глаз пользователя
  useEffect(() => {
    if (!isWidgetEdited) return;
    if (mode === MODE_WIDGET_PDF) return;
    const targetPage = editWidgetParams?.activePage;
    if (!targetPage || targetPage === activePage) return;
    goToPage(targetPage);
  }, [isWidgetEdited, mode, editWidgetParams?.activePage]);

  // РАЗМЕРЫ КАРТОЧКИ
  useEffect(() => {
    registerHandleResize({
      type: WIDGET_PDF,
      id: widgetId,
      minWidthCallback: () => TURN_SIZE_MIN_WIDTH,
      minHeightCallback: () => PDF_WIDGET_MIN_HEIGHT,
      maxHeightCallback: (newTurnWidth) => {
        const aspects = aspectsRef.current;
        if (!aspects.length) return PDF_UNBOUNDED_HEIGHT;
        const width = Math.max(newTurnWidth - 2 * widgetSpacer, 1);
        return Math.round(
          aspects.reduce((acc, aspect) => acc + width * aspect, 0) +
            PDF_PAGE_GAP * (aspects.length - 1),
        );
      },
      resizeCallback: () => {},
    });
    return () => unregisterHandleResize({ id: widgetId });
  }, [pages.length]);

  const activeQuote = useMemo(
    () => (quotes || []).find((quote) => quote.id === activeQuoteId) || null,
    [quotes, activeQuoteId],
  );
  const isCropMode = isWidgetEdited && mode === MODE_WIDGET_PDF_QUOTE_ADD;
  const cropPage = isCropMode
    ? editWidgetParams?.activePage || activePage
    : null;

  return (
    <>
      <div
        className={`pdf-content turn-widget stb-widget-pdf ${
          isWidgetEdited ? 'active' : ''
        }`}
      >
        <div className="pdf-toolbar">
          <PageBar
            activePage={isWidgetEdited ? cropPage || activePage : activePage}
            pagesCount={pages.length}
            onGoToPage={goToPage}
            isEditMode={isWidgetEdited}
          />
          {can(RULE_TURNS_CRUD) && !!pages.length && (
            <WidgetEditButton
              turnId={turnId}
              widgetId={widgetId}
              mode={MODE_WIDGET_PDF}
            />
          )}
        </div>
        <div
          className="pdf-scroll not-draggable cursor-auto"
          ref={scrollEl}
          data-test-id={TID.pdf.scroll}
          data-turn-id={turnId}
        >
        {!!error && (
          <div
            className="pdf-message pdf-message_error"
            data-test-id={TID.pdf.error}
          >
            <div>Не удалось загрузить PDF: {error.message}</div>
            {error.isNetwork && (
              <div>
                Файл недоступен или хост не отдаёт CORS-заголовки — браузер не
                даёт прочитать такой документ по внешней ссылке.
              </div>
            )}
            <div className="pdf-message__url">{url}</div>
          </div>
        )}
          {!error && !pages.length && (
            <div className="pdf-message">Загрузка PDF…</div>
          )}
          {pages.map((page) => (
            <div
              key={page.number}
              className={`pdf-page ${
                cropPage === page.number ? 'pdf-page_active' : ''
              }`}
              data-test-id={TID.pdf.page}
              data-page-number={page.number}
              style={{ height: `${Math.round(pageWidth * page.aspect)}px` }}
              ref={(node) => {
                if (node) pageElsRef.current.set(page.number, node);
                else pageElsRef.current.delete(page.number);
              }}
            >
              <canvas />
              {cropPage === page.number && (
                <div className="pdf-crop-layer" data-test-id={TID.pdf.crop}>
                  <PdfCrop
                    widgetKey={widgetKey}
                    activeQuoteId={activeQuoteId}
                    activePage={page.number}
                    initialQuote={activeQuote}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <PdfQuotes
        turnId={turnId}
        widgetId={widgetId}
        scrollEl={scrollEl}
        activeQuoteId={activeQuoteId}
        isEdited={isCropMode}
      />
    </>
  );
};

export default memo(Pdf);
