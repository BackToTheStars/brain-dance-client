import {
  PARAGRAPH_SCROLL_TIMEOUT_DELAY,
  TURN_SCROLL_TIMEOUT_DELAY,
} from '@/config/ui';
import { quoteCoordsUpdate } from '@/modules/lines/redux/actions';
import {
  markTurnAsChanged,
  updateScrollPosition,
} from '@/modules/turns/redux/actions';

import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getQueue } from '../../helpers/queueHelper';
import {
  getParagraphQuotesWithoutScroll,
  getScrolledQuotes,
} from '../../helpers/quotesHelper';

import { ParagraphOriginalTexts } from './TextWrappers';
import ParagraphEditButton from './EditButton';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { RULE_TURNS_CRUD } from '@/config/user';
import { TURN_SIZE_MIN_WIDTH } from '@/config/turn';

const paragraphScrollQueue = getQueue(PARAGRAPH_SCROLL_TIMEOUT_DELAY);
const turnScrollQueue = getQueue(TURN_SCROLL_TIMEOUT_DELAY);

const ParagraphOriginal = ({
  turnId,
  widgetId,
  registerHandleResize,
  unregisterHandleResize,
  widgetsUpdatedTime,
}) => {
  const quotesDataRef = useRef(null);
  const { can } = useUserContext();
  const widget = useSelector(
    (state) => state.turns.d[turnId].dWidgets[widgetId],
  );
  const colors = useSelector((state) => state.turns.d[turnId].colors);
  const contentType = useSelector((state) => state.turns.d[turnId].contentType);
  const size = useSelector((state) => state.turns.g[turnId].size);

  const { width, height } = size;

  const paragraph = widget.inserts;
  const fontColor = colors.font;

  const paragraphEl = useRef(null);
  const dispatch = useDispatch();

  const [scrollTop, setScrollTop] = useState(0); // дополнительный локальный стейт для быстрого ререндера цитат

  const style = {};

  if (contentType === 'comment' && fontColor) {
    style.color = fontColor;
  }

  useEffect(() => {
    if (!paragraphEl.current) return;
    let needToUpdate = false;
    let widthChanged = false;
    let firstRender = false;
    if (!quotesDataRef.current || widgetsUpdatedTime) {
      firstRender = true;
      needToUpdate = true;
      const quotesWithoutScroll = getParagraphQuotesWithoutScroll(
        turnId,
        paragraphEl,
      );
      quotesDataRef.current = {
        turnEl: paragraphEl.current.closest('.stb-react-turn'),
        width,
        height,
        scrollTop,
        quotesWithoutScroll,
        scrolledQuotes: getScrolledQuotes(
          quotesWithoutScroll,
          paragraphEl,
          scrollTop,
        ),
      };
    }
    if (!quotesDataRef.current.turnEl) {
      quotesDataRef.current.turnEl =
        paragraphEl.current.closest('.stb-react-turn');
    }

    if (width !== quotesDataRef.current.width) {
      needToUpdate = true;
      widthChanged = true;
      quotesDataRef.current.width = width;
      quotesDataRef.current.quotesWithoutScroll =
        getParagraphQuotesWithoutScroll(turnId, paragraphEl);
    }

    if (
      widthChanged ||
      height !== quotesDataRef.current.height ||
      scrollTop !== quotesDataRef.current.scrollTop
    ) {
      needToUpdate = true;
      quotesDataRef.current.height = height;
      quotesDataRef.current.scrollTop = scrollTop;
      quotesDataRef.current.scrolledQuotes = getScrolledQuotes(
        quotesDataRef.current.quotesWithoutScroll,
        paragraphEl,
        scrollTop,
      );
    }
    if (needToUpdate) {
      if (!quotesDataRef.current.scrolledQuotes?.length) {
        return;
      }
      if (firstRender) {
        dispatch(
          quoteCoordsUpdate(
            turnId,
            widgetId,
            quotesDataRef.current.scrolledQuotes,
          ),
        );
      } else {
        quotesDataRef.current.turnEl.classList.add('quotes-queued');
        turnScrollQueue.add(() => {
          dispatch(
            quoteCoordsUpdate(
              turnId,
              widgetId,
              quotesDataRef.current.scrolledQuotes,
            ),
          );
          quotesDataRef.current.turnEl.classList.remove('quotes-queued');
        });
      }
    }
  }, [width, height, scrollTop, paragraphEl.current, widgetsUpdatedTime]);

  useEffect(() => {
    if (!paragraphEl || !paragraphEl.current) return;

    const scrollHandler = () => {
      if (!!paragraphEl.current) {
        setScrollTop(paragraphEl.current.scrollTop);

        paragraphScrollQueue.add(() => {
          dispatch(
            updateScrollPosition({
              turnId,
              widgetId,
              scrollPosition: Math.floor(paragraphEl.current.scrollTop),
            }),
          );
        });
      }
    };

    paragraphEl.current.addEventListener('scroll', scrollHandler);

    return () => {
      if (!!paragraphEl.current)
        paragraphEl.current.removeEventListener('scroll', scrollHandler);
    };
  }, [paragraphEl]);

  useEffect(() => {
    if (!paragraphEl || !paragraphEl.current) return;
    const scrollHeight = paragraphEl?.current?.scrollHeight;
    const resizeInfo = {
      id: widgetId,
      type: 'paragraph',
      minWidthCallback: () => TURN_SIZE_MIN_WIDTH,
      minHeightCallback: () => 40,
      getDesiredHeight: ({ newHeight }) => {
        return newHeight;
      },
      maxHeightCallback: () => {
        return paragraphEl?.current?.scrollHeight || scrollHeight;
      },
    };
    registerHandleResize(resizeInfo);
    return () => unregisterHandleResize(widgetId);
  }, [paragraphEl]);

  useEffect(() => {
    if (!paragraphEl.current) return;
    if (scrollTop !== widget.scrollPosition) {
      paragraphEl.current.scrollTop = widget.scrollPosition;
    }
  }, [widget.scrollPosition]);

  return (
    <div
      className="wrapperParagraphText turn-widget stb-widget-paragraph"
      style={style}
    >
      <p
        className="paragraphText original-text"
        ref={paragraphEl}
        style={style}
      >
        <ParagraphOriginalTexts
          arrText={paragraph || []}
          turnId={turnId}
          turnType={contentType}
        />
      </p>
      {can(RULE_TURNS_CRUD) && (
        <ParagraphEditButton turnId={turnId} widgetId={widgetId} />
      )}
    </div>
  );
};

export default ParagraphOriginal;
