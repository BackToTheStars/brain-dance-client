import { useState, useEffect } from 'react';
// может быть, потом переделаем на Redux или Redux Saga
import { ROLES, ROLE_GAME_VISITOR, RULE_GAME_EDIT } from '../config';
import { useUiContext } from '../contexts/UI_Context';
import { UserContext, useUserContext } from '../contexts/UserContext';
import AccessCodesTable from '../widgets/AccessCodeTable';
import useGamePlayerCode from '../hooks/edit-game-code';
import EditGameForm from '../forms/EditGameForm';
import useEditGame from '../hooks/edit-game';
import useEditCodeWarningPopup from '../hooks/edit-code-warning-popup';

const getUrl = ({ hash }) => {
  return typeof window === 'undefined' // SSR
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/game?hash=${hash}`
    : window.location.href;
};

const GameInfoPanel = ({ game, setGame }) => {
  const { gameInfoPanelIsHidden, setGameInfoPanelIsHidden, addNotification } =
    useUiContext();
  const { info, can, token } = useUserContext();
  const { code, addCode } = useGamePlayerCode(token);
  const { game: editedGame, editGame } = useEditGame(token);

  const [viewMode, setViewMode] = useState(true);
  const [accessCode, setAccessCode] = useState('');
  const [userNickname, setUserNickname] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { role, nickname } = info;

  const { enterGame } = useEditCodeWarningPopup();

  const accessHandler = (event) => {
    if (event.key === 'Enter') {
      if (!accessCode) setErrorMessage('enter access code');
      else if (!userNickname) setErrorMessage('enter your nickname');
      else enterGame(accessCode, userNickname);
    } else if (!!errorMessage) {
      setErrorMessage('');
    }
  };

  useEffect(() => {
    if (editedGame) {
      setGame(editedGame);
      setViewMode(true);
    }
  }, [editedGame]);

  useEffect(() => {
    addNotification({ title: 'Info:', text: `User ${nickname} logged in.` });
  }, []);

  if (!game)
    return (
      <div
        className={`p0 ${gameInfoPanelIsHidden ? 'hidden' : ''}`}
        id="gameInfoPanel"
      >
        Loading...
      </div>
    );

  const { name, description, image, public: publicStatus, codes = [] } = game;

  return (
    <div
      className={['p0', gameInfoPanelIsHidden ? 'hidden' : ''].join(' ')}
      id="gameInfoPanel"
    >
      {!viewMode && (
        <EditGameForm
          setToggleEditForm={() => setViewMode(true)}
          game={game}
          editGame={editGame}
        />
      )}
      <table className="table game-info-table">
        <tbody>
          {viewMode && (
            <>
              <tr>
                <td>Game name:</td>
                <td>
                  <h4>
                    {name}{' '}
                    {can(RULE_GAME_EDIT) && (
                      <a
                        className="edit-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          setViewMode(false);
                        }}
                      >
                        <i className="fas fa-pen-square"></i>
                      </a>
                    )}
                  </h4>
                </td>
              </tr>
              <tr>
                <td></td>
                <td>
                  {publicStatus
                    ? 'This game is public'
                    : 'This game is private'}
                </td>
              </tr>
              <tr>
                <td>Visitor link:</td>
                <td>
                  <a href={getUrl(info)}>{getUrl(info)}</a>
                </td>
              </tr>
              <tr>
                <td>Game description:</td>
                <td>{description}</td>
              </tr>
            </>
          )}
          {can(RULE_GAME_EDIT) && viewMode && (
            <tr>
              <td>
                <p>Invite admin / player</p>
                <a
                  href="#"
                  onClick={() => addCode(game)}
                  className="btn btn-success"
                >
                  Get player code
                </a>
              </td>
              <td>
                {!!code && <span>{code}</span>}
                <AccessCodesTable codes={codes} />
              </td>
            </tr>
          )}
          <tr>
            <td>Your nickname:</td>
            <td>{nickname}</td>
          </tr>
          <tr>
            <td>Your role:</td>
            <td>
              <h4>{ROLES[role].name}</h4>
              {role === ROLE_GAME_VISITOR && (
                <>
                  <div className="row">
                    <input
                      className="mr-3 form-control col-4"
                      type="text"
                      placeholder="Enter code..."
                      onChange={(e) => setAccessCode(e.target.value)}
                      value={accessCode}
                      onKeyDown={accessHandler}
                    />
                    <input
                      className="form-control col-6"
                      type="text"
                      placeholder="Enter nickname..."
                      onChange={(e) => setUserNickname(e.target.value)}
                      value={userNickname}
                      onKeyDown={accessHandler}
                    />
                  </div>
                  {!!errorMessage && (
                    <div className="text-danger">{errorMessage}</div>
                  )}
                </>
              )}
            </td>
          </tr>
        </tbody>
      </table>
      <a
        href="#"
        onClick={() => setGameInfoPanelIsHidden(true)}
        className="btn btn-secondary ml-12px"
      >
        Close
      </a>
    </div>
  );
};

export default GameInfoPanel;
