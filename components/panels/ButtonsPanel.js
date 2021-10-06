import { useRouter } from 'next/router';
import { useUiContext } from '../contexts/UI_Context'; // export const useUiContext
import useUser from '../hooks/user'; // export default useUser
import { useUserContext } from '../contexts/UserContext';
import {
  useTurnContext,
  ACTION_RESET_TURN_EDIT_MODE,
} from '../contexts/TurnContext';
import { RULE_VIEW, RULE_TURNS_CRUD } from '../config';

const ButtonsPanel = () => {
  const {
    setGameInfoPanelIsHidden,
    state: { classesPanelIsHidden },
    dispatch,
    minimapDispatch,
    setCreateEditTurnPopupIsHidden,
  } = useUiContext();
  const {
    saveField,
    dispatch: turnDispatch,
    insertTurnFromBuffer,
  } = useTurnContext();
  const router = useRouter();
  const { info, can, isTurnInBuffer } = useUserContext();

  return (
    <div className="actions panel">
      {can(RULE_TURNS_CRUD) && (
        <>
          {isTurnInBuffer && (
            <button
              // id="add-new-box-to-game-btn"
              className="btn  btn-primary"
              onClick={(e) => {
                insertTurnFromBuffer({
                  successCallback: () => {
                    console.log('success inserted turn from buffer');
                  },
                  errorCallback: (message) => {
                    console.log(message);
                  },
                });
              }}
            >
              Paste Turn
            </button>
          )}
          <button
            id="add-new-box-to-game-btn"
            className="btn  btn-primary"
            onClick={(e) => {
              turnDispatch({ type: ACTION_RESET_TURN_EDIT_MODE });
              setCreateEditTurnPopupIsHidden(false);
            }}
          >
            Add Turn
          </button>
          <button
            id="save-positions-btn"
            className="btn  btn-primary"
            onClick={saveField}
          >
            Save Field
          </button>
        </>
      )}
      <button
        className="btn  btn-primary"
        onClick={() =>
          dispatch({ type: 'CLASS_PANEL_SET', payload: !classesPanelIsHidden })
        }
        id="toggle-left-panel"
      >
        Classes
      </button>
      {/* <button id="show-minimap-btn">Minimap</button> */}
      <button
        id="go-to-lobby"
        className="btn  btn-primary"
        onClick={() => router.push('/')}
      >
        Lobby
      </button>
      {can(RULE_VIEW) && (
        <button
          id="game-info-panel-btn"
          className="btn  btn-primary"
          onClick={() => setGameInfoPanelIsHidden((prevVal) => !prevVal)}
        >
          Info
        </button>
      )}
      <button
        className="btn  btn-primary"
        onClick={() => minimapDispatch({ type: 'MINIMAP_SHOW_HIDE' })}
      >
        Minimap
      </button>
    </div>
  );
};

export default ButtonsPanel;
