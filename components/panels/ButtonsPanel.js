import { useUiContext } from '../contexts/UI_Context';

const ButtonsPanel = () => {
  const {
    state: { classesPanelIsHidden },
    dispatch,
  } = useUiContext();

  return (
    <div className="actions">
      <button id="add-new-box-to-game-btn">Add Turn</button>
      <button id="save-positions-btn">Save Field</button>
      <button
        onClick={() =>
          dispatch({ type: 'CLASS_PANEL_SET', payload: !classesPanelIsHidden })
        }
        id="toggle-left-panel"
      >
        Left Panel
      </button>
      {/* <button id="show-minimap-btn">Minimap</button> */}
      <button id="go-to-lobby">Lobby</button>
    </div>
  );
};

export default ButtonsPanel;
