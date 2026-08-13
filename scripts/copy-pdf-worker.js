// Копирует статику pdf.js из node_modules в public — виджет PDF грузит воркер,
// шрифты и cmap'ы со своего origin (внешние CDN запрещены).
// Запускается на postinstall, поэтому версия всегда совпадает с версией
// pdfjs-dist: при рассинхроне pdf.js падает с ошибкой несовпадения версий.
// Скопированное не коммитится (см. .gitignore) — это generated-артефакты.

const fs = require('fs');
const path = require('path');

const clientDir = path.join(__dirname, '..');
const distDir = path.join(clientDir, 'node_modules', 'pdfjs-dist');

// [что копируем из pdfjs-dist, куда кладём внутри public]
const targets = [
  [path.join('build', 'pdf.worker.min.mjs'), path.join('js', 'pdf.worker.min.mjs')],
  ['standard_fonts', path.join('pdfjs', 'standard_fonts')],
  ['cmaps', path.join('pdfjs', 'cmaps')],
];

if (!fs.existsSync(distDir)) {
  // Не роняем установку: pdfjs-dist может быть ещё не распакован — виджет
  // сообщит об ошибке загрузки сам.
  console.warn('[copy-pdf-worker] pdfjs-dist не найден, пропускаю');
  process.exit(0);
}

for (const [from, to] of targets) {
  const source = path.join(distDir, from);
  const target = path.join(clientDir, 'public', to);
  if (!fs.existsSync(source)) {
    console.warn(`[copy-pdf-worker] нет ${from}, пропускаю`);
    continue;
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.cpSync(source, target, { recursive: true });
  console.log(`[copy-pdf-worker] public/${to.split(path.sep).join('/')}`);
}
