// Один рендер статьи на карточку и предпросмотр формы. markdown-it и DOMPurify грузятся
// динамически при первой нужде (как pdf.js) — страница холста без md-ходов их не несёт.

import { useEffect, useMemo, useState } from 'react';
import { createRenderer } from './markdown';

let rendererPromise = null;
let renderer = null;

export const loadMdRenderer = () => {
  if (!rendererPromise) {
    rendererPromise = Promise.all([import('markdown-it'), import('dompurify')]).then(
      ([markdownIt, purify]) => {
        // фабрика markdown-it нужна и мосту формы (свой экземпляр парсера)
        renderer = {
          ...createRenderer({ markdownIt: markdownIt.default, purify: purify.default }),
          markdownIt: markdownIt.default,
        };
        return renderer;
      },
    );
  }
  return rendererPromise;
};

// { html, ready }: html — пустая строка, ready — false, пока рендер не загружен.
export const useMdHtml = (source, { showQuoteIds = false } = {}) => {
  const [loaded, setLoaded] = useState(renderer);
  useEffect(() => {
    if (loaded) return;
    let alive = true;
    loadMdRenderer().then((instance) => alive && setLoaded(instance));
    return () => {
      alive = false;
    };
  }, []);
  return useMemo(
    () => ({ html: loaded ? loaded.render(source, { showQuoteIds }) : '', ready: !!loaded }),
    [loaded, source, showQuoteIds],
  );
};
