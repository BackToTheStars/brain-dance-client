import { useRouter } from 'next/router';
import { useUiContext } from '../contexts/UI_Context'; // export const useUiContext
import useUser from '../hooks/user'; // export default useUser
import { RULE_TURNS_CRUD, RULE_GAME_EDIT } from '../config';

const ButtonsPanel = () => {
  const {
    setGameInfoPanelIsHidden,

    state: { classesPanelIsHidden },
    dispatch,
  } = useUiContext();
  const router = useRouter();
  const { info, can } = useUser(router.query.hash);

  return (
    <div className="actions">
      {can(RULE_TURNS_CRUD) && (
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
      {can(RULE_GAME_EDIT) && (
        <button
          id="game-info-panel-btn"
          onClick={() => setGameInfoPanelIsHidden((prevVal) => !prevVal)}
        >
          Info
        </button>
      )}
    </div>
  );
};

export default ButtonsPanel;
