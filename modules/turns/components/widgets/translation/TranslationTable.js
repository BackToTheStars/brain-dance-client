// Карточка хода «Перевод текста»: ряды { id, left, right } в одном прокручиваемом теле, ряд —
// две равные колонки (высота по большей ячейке), над рядами — языки колонок, если заданы.
// Ячейка — md без id выделений: цвет есть, цитат и линий нет. Прокрутка с памятью и
// регистрация ресайза — useQuotedBody с пустой подписью цитат, как у статьи без выделений.

import { TID } from '@/config/testIds';
import { TRANSLATION_MIN_WIDTH } from '@/config/turn';
import { RULE_TURNS_CRUD } from '@/config/user';
import { WIDGET_TRANSLATION } from '@/modules/turns/settings';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { memo, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import MdEditButton from '../md/MdEditButton';
import { useMdMarkVars } from '../md/MdHtml';
import { useMdRenderer } from '../md/mdRenderer';
import { useQuotedBody } from '../useQuotedBody';
import TranslationGrid from './TranslationGrid';

const TranslationTable = ({
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
  const { rows, languages } = widget;
  const ready = !!useMdRenderer();
  const bodyEl = useRef(null);
  const markVars = useMdMarkVars();

  // содержимое меняется с рядами и языками и один раз — когда загрузился рендер
  const contentKey = useMemo(
    () => (ready ? JSON.stringify([rows, languages]) : ''),
    [ready, rows, languages],
  );

  useQuotedBody({
    turnId,
    widgetId,
    resizeType: WIDGET_TRANSLATION,
    bodyRef: bodyEl,
    widgetsUpdatedTime,
    quotesSignature: '',
    contentKey,
    scrollPosition: widget.scrollPosition,
    registerHandleResize,
    unregisterHandleResize,
    // до загрузки рендера виджет не зарегистрирован: Turn.js ждёт его и не пересчитывает высоту
    ready,
    minWidth: TRANSLATION_MIN_WIDTH,
  });

  return (
    <div className="turn-widget stb-widget-translation" style={markVars}>
      <div
        className="translation-body"
        ref={bodyEl}
        data-test-id={TID.translation.body}
        data-turn-id={turnId}
      >
        <TranslationGrid rows={rows} languages={languages} />
      </div>
      {can(RULE_TURNS_CRUD) && (
        <MdEditButton turnId={turnId} widgetId={widgetId} />
      )}
    </div>
  );
};

export default memo(TranslationTable);
