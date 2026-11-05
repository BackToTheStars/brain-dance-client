// Сетка перевода без стора: строка языков (если хоть один задан) и ряды по две ячейки md без id
// выделений. На ней стоят карточка (TranslationTable) и предпросмотр формы (TranslationEditor).

import { TID } from '@/config/testIds';
import { memo } from 'react';
import MdHtml from '../md/MdHtml';

const TranslationGrid = ({ rows, languages }) => {
  const showLanguages = !!(languages?.left || languages?.right);
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
      {rows.map((row) => (
        <div
          className="translation-row"
          key={row.id}
          data-test-id={TID.translation.row}
          data-row-id={row.id}
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
      ))}
    </>
  );
};

export default memo(TranslationGrid);
