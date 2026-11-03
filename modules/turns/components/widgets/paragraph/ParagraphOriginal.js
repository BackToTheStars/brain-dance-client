import React, { useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';

import { ParagraphOriginalTexts } from './TextWrappers';
import ParagraphEditButton from './EditButton';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { RULE_TURNS_CRUD } from '@/config/user';
import { useQuotedBody } from '../useQuotedBody';

const ParagraphOriginal = ({
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
  const colors = useSelector((state) => state.turns.d[turnId].colors);
  const contentType = useSelector((state) => state.turns.d[turnId].contentType);

  const paragraph = widget.inserts;
  const fontColor = colors.font;

  // id инсертов-цитат, из которых рендерятся span[data-id]: пусто — цитат нет
  const quotesSignature = (paragraph || [])
    .filter((ins) => ins?.attributes?.background && ins.attributes.id)
    .map((ins) => ins.attributes.id)
    .join(',');
  // правка формой меняет слова под цитатами, не меняя размеров карточки
  const contentKey = useMemo(() => JSON.stringify(paragraph || []), [paragraph]);

  const paragraphEl = useRef(null);

  const style = {};

  if (contentType === 'comment' && fontColor) {
    style.color = fontColor;
  }

  useQuotedBody({
    turnId,
    widgetId,
    resizeType: 'paragraph',
    bodyRef: paragraphEl,
    widgetsUpdatedTime,
    quotesSignature,
    contentKey,
    scrollPosition: widget.scrollPosition,
    registerHandleResize,
    unregisterHandleResize,
  });

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
