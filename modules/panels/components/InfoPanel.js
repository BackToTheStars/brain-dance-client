import { ROLES, ROLE_GAME_VISITOR, RULE_GAME_EDIT } from '@/config/user';
import CodeEnterForm from '@/modules/game/components/forms/CodeEnterForm';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { useDispatch, useSelector } from 'react-redux';
import { togglePanel } from '../redux/actions';
import { PANEL_INFO } from '../settings';
import EditGameForm from './info/EditGameForm';
import { useState } from 'react';

const getUrl = ({ hash }) => {
  return typeof window === 'undefined' // SSR
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/game?hash=${hash}`
    : window.location.href;
};

const InfoPanel = () => {
  const dispatch = useDispatch();
  const game = useSelector((state) => state.game.game);
  const [viewMode, setViewMode] = useState(true);

  const { info, can } = useUserContext();
  const { role, nickname } = info;

  if (!game) return <>Loading...</>;

  const { name, description, public: publicStatus, codes = [] } = game;

  return (
    <div className="pb-3">
      {!viewMode && <EditGameForm />}
      <table className="table game-info-table table-dark table-striped">
        <tbody>
          {viewMode && (
            <>
              <tr className="td-no-borders">
                <td>Game name:</td>
                <td>
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
          <tr className="td-no-borders">
            <td>Your nickname:</td>
            <td>{nickname}</td>
          </tr>
          <tr>
            <td>Your role:</td>
            <td>
              {ROLES[role].name}
              {role === ROLE_GAME_VISITOR && <CodeEnterForm />}
            </td>
          </tr>
        </tbody>
      </table>
      {viewMode ? (
        <button
          onClick={() => dispatch(togglePanel({ type: PANEL_INFO }))}
          className="btn btn-primary ms-3"
        >
          Close
        </button>
      ) : (
        <button
          style={{ minWidth: '75px' }}
          className="btn btn-danger ms-3"
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
