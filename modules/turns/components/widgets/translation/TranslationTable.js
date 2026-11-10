// Карточка хода «Перевод текста»: ряды { id, left, right } в одном прокручиваемом теле, ряд —
// две равные колонки (высота по большей ячейке), над рядами — языки колонок, если заданы.
// Ячейка — md без id выделений: цвет есть, цитат и линий нет. Прокрутка с памятью и
// регистрация ресайза — useQuotedBody с пустой подписью цитат, как у статьи без выделений.
// Пока рендер md не загружен, в теле вместо сетки пустых рядов — строка загрузки. Ряды вне окна
// прокрутки сетка рисует разделителями суммарной высоты (TranslationGrid), поэтому высота тела до
// их отрисовки — оценка: для регистрации ресайза этого достаточно.

import { TID } from '@/config/testIds';
import { TRANSLATION_MIN_WIDTH } from '@/config/turn';
import { RULE_TURNS_CRUD } from '@/config/user';
import { WIDGET_TRANSLATION } from '@/modules/turns/settings';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { useTranslations } from 'next-intl';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
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
  const t = useTranslations('Game.translation');
  const { can } = useUserContext();
  const widget = useSelector(
    (state) => state.turns.d[turnId].dWidgets[widgetId],
  );
  const { rows, languages } = widget;
  const ready = !!useMdRenderer();
  // Тело — скроллер сетки и тело для useQuotedBody; сетка монтируется только после того, как
  // элемент попал в ref: ref родителя React ставит после layout-эффектов детей, и при уже
  // загруженном рендере md хук сетки увидел бы пустой ref и отрисовал все ряды разом.
  const bodyEl = useRef(null);
  const [bodyMounted, setBodyMounted] = useState(false);
  const bindBody = useCallback((el) => {
    bodyEl.current = el;
    if (el) setBodyMounted(true);
  }, []);
  // scrollTop, выставленный сеткой при сдвиге заглушек, — не прокрутка пользователя
  const ownScroll = useRef(null);
  const markVars = useMdMarkVars();

  // содержимое меняется с рядами и языками и один раз — когда загрузился рендер; счётчик смен
  // вместо строки всех рядов
  const changes = useRef(0);
  const version = useMemo(() => (changes.current += 1), [rows, languages]);
  const contentKey = ready ? `v${version}` : '';

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
    ownScrollRef: ownScroll,
  });

  return (
    <div className="turn-widget stb-widget-translation" style={markVars}>
      <div
        className="translation-body"
        ref={bindBody}
        data-test-id={TID.translation.body}
        data-turn-id={turnId}
      >
        {ready && bodyMounted ? (
          <TranslationGrid
            rows={rows}
            languages={languages}
            scrollRef={bodyEl}
            ownScrollRef={ownScroll}
          />
        ) : (
          <div
            className="translation-loading"
            data-test-id={TID.translation.loading}
          >
            {t('loading')}
          </div>
        )}
      </div>
      {can(RULE_TURNS_CRUD) && (
        <MdEditButton turnId={turnId} widgetId={widgetId} />
      )}
    </div>
  );
};

export default memo(TranslationTable);
