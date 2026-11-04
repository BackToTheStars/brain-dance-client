// Статья хода md: HTML из исходника виджета md_1, прокрутка, рамки выделений-цитат и концы
// линий — тем же путём, что у абзаца (useQuotedBody), узлы цитат — mark[data-id].

import { TID } from '@/config/testIds';
import { RULE_TURNS_CRUD } from '@/config/user';
import { WIDGET_MD } from '@/modules/turns/settings';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { memo, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import ParagraphQuotes from '../paragraph/ParagraphQuotes';
import { useQuotedBody } from '../useQuotedBody';
import { MARK_COLOR_REMAP } from './markColorRemap';
import { markColorVars } from './markColors';
import { parseMarks } from './markdown';
import MdEditButton from './MdEditButton';
import { useMdHtml } from './mdRenderer';

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
  const source = widget.source || '';
  const { html, ready } = useMdHtml(source);

  // id выделений исходника: пусто — цитат нет
  const quotesSignature = useMemo(
    () =>
      parseMarks(source)
        .filter((mark) => mark.id !== null)
        .map((mark) => mark.id)
        .join(','),
    [source],
  );

  const bodyEl = useRef(null);
  // тип md своих вариантов в colorSet не имеет — цвета как у цитат абзаца на обычной карточке
  const markVars = useMemo(() => markColorVars({ remap: MARK_COLOR_REMAP }), []);

  useQuotedBody({
    turnId,
    widgetId,
    resizeType: WIDGET_MD,
    bodyRef: bodyEl,
    widgetsUpdatedTime,
    quotesSignature,
    // HTML меняется с исходником и один раз — когда загрузился рендер
    contentKey: html,
    scrollPosition: widget.scrollPosition,
    registerHandleResize,
    unregisterHandleResize,
    // до загрузки рендера виджет не зарегистрирован: Turn.js ждёт его и не пересчитывает высоту
    ready,
  });

  return (
    <>
      <div className="turn-widget stb-widget-md" style={markVars}>
        <div
          className="md-body md-content"
          ref={bodyEl}
          data-test-id={TID.md.body}
          data-turn-id={turnId}
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {can(RULE_TURNS_CRUD) && (
          <MdEditButton turnId={turnId} widgetId={widgetId} />
        )}
      </div>
      <ParagraphQuotes turnId={turnId} widgetId={widgetId} />
    </>
  );
};

export default memo(MdArticle);
