// import { useState, useEffect } from 'react';
// import CodeEnterForm from '../forms/CodeEnterForm';
// // может быть, потом переделаем на Redux или Redux Saga
// import { ROLES, ROLE_GAME_VISITOR, RULE_GAME_EDIT } from '../config';
// import { useUiContext } from '../contexts/UI_Context';
// import { useUserContext } from '../contexts/UserContext';
// import AccessCodesTable from '../widgets/AccessCodeTable';
// import useGamePlayerCode from '../hooks/edit-game-code';
// import EditGameForm from '../forms/EditGameForm';
// import useEditGame from '../hooks/edit-game';

const getUrl = ({ hash }) => {
  return typeof window === 'undefined' // SSR
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/game?hash=${hash}`
    : window.location.href;
};

const InfoPanel = ({ game, setGame }) => {
  return 'InfoPanel';

  const { gameInfoPanelIsHidden, setGameInfoPanelIsHidden, addNotification } =
    useUiContext();
  const { info, can, token } = useUserContext();
  const { code, addCode, codes: newGameAccessCodes } = useGamePlayerCode(token);
  const { game: editedGame, editGame } = useEditGame(token);

  const [viewMode, setViewMode] = useState(true);

  const { role, nickname } = info;

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
      className={`p0 ${gameInfoPanelIsHidden ? 'hidden' : ''} panel`}
      id="gameInfoPanel"
    >
      {!viewMode && <EditGameForm game={game} editGame={editGame} />}
      <table className="table game-info-table table-dark">
        <tbody>
          {viewMode && (
            <>
              <tr className="td-no-borders">
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
                <td>Game type:</td>
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
              <td className="pt-0 pb-0">
                {/* {!!code && <span>{code}</span>} */}
                <AccessCodesTable
                  newAccessCode={code}
                  codes={newGameAccessCodes.length ? newGameAccessCodes : codes}
                />
              </td>
            </tr>
          )}
          <tr className="td-no-borders">
            <td>Your nickname:</td>
            <td>{nickname}</td>
          </tr>
          <tr>
            <td>Your role:</td>
            <td>
              <h4>{ROLES[role].name}</h4>
              {role === ROLE_GAME_VISITOR && <CodeEnterForm />}
            </td>
          </tr>
        </tbody>
      </table>
      {viewMode ? (
        <button
          onClick={() => setGameInfoPanelIsHidden(true)}
          className="btn btn-secondary"
        >
          Close
        </button>
      ) : (
        <button
          style={{ minWidth: '75px' }}
          className="btn btn-danger"
          onClick={() => {
            setViewMode(true);
          }}
        >
          Cancel
        </button>
      )}
    </div>
  );
};

export default InfoPanel;
