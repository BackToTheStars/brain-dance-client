import { useRouter } from 'next/router';
import { useUiContext } from '../contexts/UI_Context'; // export const useUiContext
import useUser from '../hooks/user'; // export default useUser

const ButtonsPanel = () => {
  const {
    state: { classesPanelIsHidden },
    dispatch,
  } = useUiContext();
  const router = useRouter();
  const { info } = useUser(router.query.hash);

  return (
    <div className="actions">
      {info.role === 2 && (
        <>
          <button id="add-new-box-to-game-btn">Add Turn</button>
          <button id="save-positions-btn">Save Field</button>
        </>
      )}
      <button
        onClick={() =>
          dispatch({ type: 'CLASS_PANEL_SET', payload: !classesPanelIsHidden })
        }
        id="toggle-left-panel"
      >
        Classes
      </button>
      {/* <button id="show-minimap-btn">Minimap</button> */}
      <button id="go-to-lobby">Lobby</button>
    </div>
  );
};

export default ButtonsPanel;
