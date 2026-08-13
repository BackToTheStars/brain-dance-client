// Единая точка входа в pdf.js: библиотека грузится динамически (в SSR её нельзя
// импортировать — внутри обращения к DOM) и один раз на всё приложение.
// Воркер и шрифты лежат в public/ и копируются туда на postinstall
// (scripts/copy-pdf-worker.js) — внешние CDN запрещены.

export const PDF_WORKER_SRC = '/js/pdf.worker.min.mjs';
export const PDF_STANDARD_FONTS_URL = '/pdfjs/standard_fonts/';
export const PDF_CMAPS_URL = '/pdfjs/cmaps/';

let pdfjsPromise = null;

export const loadPdfjs = () => {
  if (!pdfjsPromise) {
    pdfjsPromise = import('pdfjs-dist/build/pdf.mjs').then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC;
      return pdfjs;
    });
  }
  return pdfjsPromise;
};

export const getDocumentParams = (url) => ({
  url,
  cMapUrl: PDF_CMAPS_URL,
  cMapPacked: true,
  standardFontDataUrl: PDF_STANDARD_FONTS_URL,
});
