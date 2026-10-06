import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { VerticalSplit } from '@/modules/ui/components/common/VerticalSplit';
import { useSlider } from '@/modules/ui/hooks/useSlider';
import {
  EDITOR_PANEL_MIN_WIDTH,
  MEDIA_QUOTES_PANEL_MIN_WIDTH,
  PANEL_ADD_EDIT_TURN,
  PANEL_MEDIA_QUOTES,
} from '@/config/panel';
import { TID } from '@/config/testIds';
import { changePanelGeometry } from '../redux/actions';
import {
  getEditorPanelMaxWidth,
  getEditorPanelWidth,
  getMediaQuotesPanelWidth,
  saveEditorPanelWidth,
  saveMediaQuotesPanelWidth,
} from '../helpers/editorPanel';

const maxWidthCallback = (wrapper) => getEditorPanelMaxWidth(wrapper);

// Ручка на левом краю панели, прижатой вправо: сдвиг влево её расширяет —
// дельта инвертируется здесь. Ширина живёт в геометрии панели, пишется по mouseup.
const PanelWidthSplit = ({ type, minWidth, getWidth, saveWidth, testId }) => {
  const dispatch = useDispatch();
  const store = useStore();
  const width = useSelector(getWidth);
  const [wrapper, setWrapper] = useState(null);
  const minWidthCallback = useCallback(() => minWidth, [minWidth]);

  useEffect(() => {
    setWrapper(document.documentElement);
  }, []);

  // useSlider зовёт сеттер и числом, и функцией от прежнего значения (ужатие до
  // максимума) — как setState.
  const setWidth = useCallback(
    (next) => {
      const current = getWidth(store.getState());
      const value = typeof next === 'function' ? next(current) : next;
      if (!Number.isFinite(value) || value === current) return;
      dispatch(changePanelGeometry(type, { width: value }));
    },
    [dispatch, store, type, getWidth],
  );

  const { move, setIsDragging } = useSlider(
    width,
    setWidth,
    wrapper,
    minWidthCallback,
    maxWidthCallback,
    { clamp: true },
  );

  const moveInverted = useCallback((delta) => move(-delta), [move]);

  const onDragging = useCallback(
    (dragging) => {
      setIsDragging(dragging);
      if (!dragging) {
        saveWidth(getWidth(store.getState()));
      }
    },
    [setIsDragging, store, getWidth, saveWidth],
  );

  return (
    <VerticalSplit
      move={moveInverted}
      setIsDragging={onDragging}
      extraClasses="editor-panel__split"
      testId={testId}
    />
  );
};

const EditorPanelSplit = () => (
  <PanelWidthSplit
    type={PANEL_ADD_EDIT_TURN}
    minWidth={EDITOR_PANEL_MIN_WIDTH}
    getWidth={getEditorPanelWidth}
    saveWidth={saveEditorPanelWidth}
    testId={TID.addTurn.split}
  />
);

// Ширина панели правки цитат помнится отдельно от формы хода.
export const MediaQuotesPanelSplit = () => (
  <PanelWidthSplit
    type={PANEL_MEDIA_QUOTES}
    minWidth={MEDIA_QUOTES_PANEL_MIN_WIDTH}
    getWidth={getMediaQuotesPanelWidth}
    saveWidth={saveMediaQuotesPanelWidth}
    testId={TID.mediaQuotes.split}
  />
);

export default EditorPanelSplit;
