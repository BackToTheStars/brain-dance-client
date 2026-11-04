import { useEffect, useRef, useState } from 'react';
import { loadMdRenderer } from '../widgets/md/mdRenderer';

export const MD_MODE_VISUAL = 'visual';
export const MD_MODE_SOURCE = 'source';

let bridgePromise = null;

// Мост грузится вместе с markdown-it, при первой статье в форме: странице холста без
// md-ходов он не нужен.
const loadBridge = () => {
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

// Статья md в единственном Quill формы. Источник правды — form.markdown: правка в Visual
// пишет его через deltaToMarkdown, Quill только показывает. Абзац хода, пока Quill занят
// статьёй, лежит в stash и возвращается в Quill как был — содержимое у типов своё.
export const useMdBridge = ({ quill, isMd, markdown, setMarkdown }) => {
  const [mode, setMode] = useState(MD_MODE_VISUAL);
  const [bridge, setBridge] = useState(null);
  const [unsupported, setUnsupported] = useState([]);
  const [showing, setShowing] = useState(false);
  // Открытие другого хода: прежняя статья и отложенный абзац не годятся.
  const [generation, setGeneration] = useState(0);
  const stashRef = useRef(null);
  const showingRef = useRef(false);
  const bridgeRef = useRef(null);
  bridgeRef.current = bridge;
  const markdownRef = useRef(markdown);
  markdownRef.current = markdown;
  const setMarkdownRef = useRef(setMarkdown);
  setMarkdownRef.current = setMarkdown;

  const wantVisual = isMd && mode === MD_MODE_VISUAL;

  useEffect(() => {
    if (!isMd || bridge) return;
    let alive = true;
    loadBridge()
      .then((loaded) => alive && setBridge(loaded))
      .catch(() => alive && setMode(MD_MODE_SOURCE));
    return () => {
      alive = false;
    };
  }, [isMd, bridge]);

  useEffect(() => {
    if (!quill) return;
    const want = wantVisual && !!bridge;
    if (want && !showingRef.current) {
      const { ops, unsupported: reasons } = bridge.toDelta(markdownRef.current);
      setUnsupported(reasons);
      if (reasons.length) {
        setMode(MD_MODE_SOURCE);
        return;
      }
      stashRef.current = quill.getContents().ops;
      showingRef.current = true;
      quill.setContents(ops, 'api');
      quill.history?.clear();
      setShowing(true);
    } else if (!want && showingRef.current) {
      showingRef.current = false;
      quill.setContents(stashRef.current || [], 'api');
      stashRef.current = null;
      quill.history?.clear();
      setShowing(false);
    }
  }, [quill, wantVisual, bridge, generation]);

  // Правка автора в Visual — в исходник; setContents моста ('api') исходник не трогает,
  // поэтому вход в Visual без правок оставляет исходник как был.
  useEffect(() => {
    if (!quill) return;
    const onChange = (delta, oldDelta, source) => {
      if (!showingRef.current || source !== 'user' || !bridgeRef.current) return;
      setMarkdownRef.current(bridgeRef.current.toMarkdown(quill.getContents().ops));
    };
    quill.on('text-change', onChange);
    return () => quill.off('text-change', onChange);
  }, [quill]);

  // В Source кнопка Visual ждёт, пока из исходника не уберут то, чего мост не знает.
  useEffect(() => {
    if (!isMd || mode !== MD_MODE_SOURCE || !bridge) return;
    const timer = setTimeout(
      () => setUnsupported(bridge.toDelta(markdownRef.current).unsupported),
      300,
    );
    return () => clearTimeout(timer);
  }, [isMd, mode, bridge, markdown]);

  // Форма заливает в Quill абзац другого хода сама; мост начинает с Visual заново.
  const reset = () => {
    stashRef.current = null;
    showingRef.current = false;
    setShowing(false);
    setUnsupported([]);
    setMode(MD_MODE_VISUAL);
    setGeneration((value) => value + 1);
  };

  return {
    mode,
    showing,
    // и после загрузки моста, пока эффект не залил статью в Quill: иначе на кадр мелькал Source
    loading: wantVisual && !showing,
    unsupported,
    canVisual: !!bridge && !unsupported.length,
    toSource: () => setMode(MD_MODE_SOURCE),
    toVisual: () => {
      if (!bridge) return;
      const reasons = bridge.toDelta(markdownRef.current).unsupported;
      setUnsupported(reasons);
      if (!reasons.length) setMode(MD_MODE_VISUAL);
    },
    reset,
    // Абзац хода: пока Quill показывает статью, он отложен.
    paragraphOps: (editorOps) => (showingRef.current ? stashRef.current || [] : editorOps),
    isShowing: () => showingRef.current,
  };
};
