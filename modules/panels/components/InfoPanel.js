import { ROLES, ROLE_GAME_VISITOR, RULE_GAME_EDIT } from '@/config/user';
import CodeEnterForm from '@/modules/game/components/forms/CodeEnterForm';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { useDispatch, useSelector } from 'react-redux';
import { togglePanel } from '../redux/actions';
import { PANEL_INFO } from '../settings';
import EditGameForm from './info/EditGameForm';
import { useState } from 'react';
import { Button } from 'antd';

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
    <>
      <div className="pb-3">
        {!viewMode && <EditGameForm />}
        <table className="table-auto w-full text-left border-collapse border border-gray-300 rounded-lg">
          <tbody>
            {viewMode && (
              <>
                <tr className="border-b border-gray-300">
                  <td className="py-2 px-4">Game name:</td>
                  <td className="py-2 px-4">
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
                <tr className="border-b border-gray-300">
                  <td className="py-2 px-4">Game type:</td>
                  <td className="py-2 px-4">
                    {publicStatus
                      ? 'This game is public'
                      : 'This game is private'}
                  </td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="py-2 px-4">Visitor link:</td>
                  <td className="py-2 px-4">
                    <a href={getUrl(info)}>{getUrl(info)}</a>
                  </td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="py-2 px-4">Game description:</td>
                  <td className="py-2 px-4">{description}</td>
                </tr>
              </>
            )}
            <tr className="border-b border-gray-300">
              <td className="py-2 px-4">Your nickname:</td>
              <td className="py-2 px-4">{nickname}</td>
            </tr>
            <tr className="border-b border-gray-300">
              <td className="py-2 px-4">Your role:</td>
              <td className="py-2 px-4">
                {ROLES[role].name}
                {/* {role === ROLE_GAME_VISITOR &&  */}
                <CodeEnterForm hash={game.hash} />
                {/* } */}
              </td>
            </tr>
          </tbody>
        </table>
        <div className="p-3">
          {viewMode ? (
            <Button
              size="small"
              onClick={() => dispatch(togglePanel({ type: PANEL_INFO }))}
              className="px-3 py-2 bg-blue-500 text-white rounded"
            >
              Close
            </Button>
          ) : (
            <Button
              size="small"
              className="px-3 py-2 bg-blue-500 text-white rounded"
              onClick={() => {
                setViewMode(true);
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default InfoPanel;
