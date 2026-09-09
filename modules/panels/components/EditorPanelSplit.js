import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { VerticalSplit } from '@/modules/ui/components/common/VerticalSplit';
import { useSlider } from '@/modules/ui/hooks/useSlider';
import { EDITOR_PANEL_MIN_WIDTH, PANEL_ADD_EDIT_TURN } from '@/config/panel';
import { TID } from '@/config/testIds';
import { changePanelGeometry } from '../redux/actions';
import {
  getEditorPanelMaxWidth,
  getEditorPanelWidth,
  saveEditorPanelWidth,
} from '../helpers/editorPanel';

const minWidthCallback = () => EDITOR_PANEL_MIN_WIDTH;
const maxWidthCallback = (wrapper) => getEditorPanelMaxWidth(wrapper);

// Ручка на левом краю: панель прижата вправо, поэтому сдвиг влево её расширяет —
// дельта инвертируется здесь. Ширина живёт в геометрии панели, пишется по mouseup.
const EditorPanelSplit = () => {
  const dispatch = useDispatch();
  const store = useStore();
  const width = useSelector(getEditorPanelWidth);
  const [wrapper, setWrapper] = useState(null);

  useEffect(() => {
    setWrapper(document.documentElement);
  }, []);

  // useSlider зовёт сеттер и числом, и функцией от прежнего значения (ужатие до
  // максимума) — как setState.
  const setWidth = useCallback(
    (next) => {
      const current = getEditorPanelWidth(store.getState());
      const value = typeof next === 'function' ? next(current) : next;
      if (!Number.isFinite(value) || value === current) return;
      dispatch(changePanelGeometry(PANEL_ADD_EDIT_TURN, { width: value }));
    },
    [dispatch, store],
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
        saveEditorPanelWidth(getEditorPanelWidth(store.getState()));
      }
    },
    [setIsDragging, store],
  );

  return (
    <VerticalSplit
      move={moveInverted}
      setIsDragging={onDragging}
      extraClasses="editor-panel__split"
      testId={TID.addTurn.split}
    />
  );
};

export default EditorPanelSplit;
