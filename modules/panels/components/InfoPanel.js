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

import { ROLES, ROLE_GAME_VISITOR, RULE_GAME_EDIT } from '@/config/user';
import CodeEnterForm from '@/modules/game/components/forms/CodeEnterForm';
import { addNotification } from '@/modules/ui/redux/actions';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Fragment } from 'react/cjs/react.development';
import { togglePanel } from '../redux/actions';
import { PANEL_INFO } from '../settings';
import EditGameForm from './info/EditGameForm';

const getUrl = ({ hash }) => {
  return typeof window === 'undefined' // SSR
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/game?hash=${hash}`
    : window.location.href;
};

const InfoPanel = ({ setGame }) => {
  const dispatch = useDispatch();
  const game = useSelector((state) => state.game.game);
  const [viewMode, setViewMode] = useState(true);

  const { info, can } = useUserContext();
  const { role, nickname } = info;
  // const { code, addCode, codes: newGameAccessCodes } = useGamePlayerCode(token);
  // const { game: editedGame, editGame } = useEditGame(token);

  // useEffect(() => {
  //   if (editedGame) {
  //     setGame(editedGame);
  //     setViewMode(true);
  //   }
  // }, [editedGame]);

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
          {/* {can(RULE_GAME_EDIT) &&
            viewMode &&
            // <tr> */}
          {
            /* <td>
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
                 {!!code && <span>{code}</span>} 
                <AccessCodesTable
                  newAccessCode={code}
                  codes={newGameAccessCodes.length ? newGameAccessCodes : codes}
                />
              </td>*/
            // </tr>
          }
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
