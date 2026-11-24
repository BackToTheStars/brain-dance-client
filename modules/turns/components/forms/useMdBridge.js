import { loadMdRenderer } from '../widgets/md/mdRenderer';

let bridgePromise = null;

// Мост md ↔ Quill для Visual ячеек статьи и перевода. Грузится вместе с markdown-it, при первой
// такой ячейке в форме: странице холста без них он не нужен.
export const loadBridge = () => {
  if (!bridgePromise) {
    bridgePromise = Promise.all([loadMdRenderer(), import('../widgets/md/mdDelta')])
      .then(([renderer, { markdownToDelta, deltaToMarkdown }]) => ({
        toDelta: (source) => markdownToDelta(source, { markdownIt: renderer.markdownIt }),
        toMarkdown: deltaToMarkdown,
      }))
      .catch((error) => {
        bridgePromise = null;
        throw error;
      });
  }
  return bridgePromise;
};
