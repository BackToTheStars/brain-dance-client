import { useRouter } from 'next/router';
import { useUiContext } from '../contexts/UI_Context'; // export const useUiContext
import useUser from '../hooks/user'; // export default useUser
import { useUserContext } from '../contexts/UserContext';

import { RULE_VIEW, RULE_TURNS_CRUD, RULE_GAME_EDIT } from '../config';

const ButtonsPanel = () => {
  const {
    setGameInfoPanelIsHidden,

    state: { classesPanelIsHidden },
    dispatch,
    minimapDispatch,
  } = useUiContext();
  const router = useRouter();
  const { info, can } = useUserContext();

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
      {can(RULE_VIEW) && (
        <button
          id="game-info-panel-btn"
          onClick={() => setGameInfoPanelIsHidden((prevVal) => !prevVal)}
        >
          Info
        </button>
      )}
      <button onClick={() => minimapDispatch({ type: 'MINIMAP_SHOW_HIDE' })}>
        Minimap
      </button>
    </div>
  );
};

export default ButtonsPanel;
