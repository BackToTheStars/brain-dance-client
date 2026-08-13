// Индикатор активной страницы и переходы по документу. Виден и при обычном
// просмотре: активная страница — это та, в которую упирается цитирование,
// поэтому пользователь должен понимать, где он находится, ещё до входа в
// режим правки.

import { TID } from '@/config/testIds';
import { memo } from 'react';

const PageBar = ({ activePage, pagesCount, onGoToPage, isEditMode }) => {
  if (!pagesCount) return null;

  const go = (page) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (page < 1 || page > pagesCount) return;
    onGoToPage(page);
  };

  return (
    <div
      className={`pdf-page-bar not-draggable ${isEditMode ? 'pdf-page-bar_edit' : ''}`}
      data-test-id={TID.pdf.pageBar}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="pdf-page-bar__btn"
        data-test-id={TID.pdf.pagePrev}
        disabled={activePage <= 1}
        onClick={go(activePage - 1)}
      >
        ‹
      </button>
      <span className="pdf-page-bar__label" data-test-id={TID.pdf.pageLabel}>
        {activePage} / {pagesCount}
      </span>
      <button
        type="button"
        className="pdf-page-bar__btn"
        data-test-id={TID.pdf.pageNext}
        disabled={activePage >= pagesCount}
        onClick={go(activePage + 1)}
      >
        ›
      </button>
    </div>
  );
};

export default memo(PageBar);
