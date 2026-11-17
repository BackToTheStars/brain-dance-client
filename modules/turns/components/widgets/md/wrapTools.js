// Кнопки обёртки выделенного в исходнике markdown: одна таблица и одна функция для textarea
// статьи (MdEditor) и ячеек перевода (TranslationEditor).

import { MD_COLOR_EMOJI } from './markdown';

const COLOR_NAMES = {
  y: 'yellow',
  g: 'green',
  p: 'pink',
  b: 'blue',
  s: 'gray',
  o: 'orange',
  r: 'red',
};

export const WRAPS = [
  { name: 'bold', title: 'Bold', label: 'B', before: '**', after: '**' },
  { name: 'italic', title: 'Italic', label: 'I', before: '*', after: '*' },
  { name: 'link', title: 'Link', label: '🔗', before: '[', after: '](https://)' },
  ...Object.entries(MD_COLOR_EMOJI).map(([key, emoji]) => ({
    name: `mark-${key}`,
    title: `Highlight ${COLOR_NAMES[key] || key}`,
    label: emoji,
    before: `==${emoji} `,
    after: '==',
  })),
];

// Текст с обёрнутым выделением и само выделение на новом месте — на том же тексте внутри обёртки.
export const wrapSelection = (source, start, end, { before, after }) => ({
  text: source.slice(0, start) + before + source.slice(start, end) + after + source.slice(end),
  start: start + before.length,
  end: end + before.length,
});
