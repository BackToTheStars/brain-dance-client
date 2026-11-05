// Тело md из исходника пропом: HTML рендера в узле .md-content. На нём стоят статья md_1 и
// ячейки перевода; переменные цветов выделений (--md-mark-*) ставит контейнер через useMdMarkVars.

import { memo, useMemo } from 'react';
import { MARK_COLOR_REMAP } from './markColorRemap';
import { markColorVars } from './markColors';
import { useMdHtml } from './mdRenderer';

// тип md своих вариантов в colorSet не имеет — цвета как у цитат абзаца на обычной карточке
export const useMdMarkVars = () =>
  useMemo(() => markColorVars({ remap: MARK_COLOR_REMAP }), []);

// markIds: false — выделения без data-id (оформление без цитат и линий); bodyRef — узел тела;
// остальные пропсы уходят на узел (data-test-id, data-turn-id, data-side).
const MdHtml = ({ source, markIds = true, bodyRef, className = '', ...attrs }) => {
  const { html } = useMdHtml(source || '', { markIds });
  return (
    <div
      ref={bodyRef}
      className={className ? `md-content ${className}` : 'md-content'}
      dangerouslySetInnerHTML={{ __html: html }}
      {...attrs}
    />
  );
};

export default memo(MdHtml);
