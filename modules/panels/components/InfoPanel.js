import { ROLES, ROLE_GAME_VISITOR, RULE_GAME_EDIT, RULE_TURNS_CRUD } from '@/config/user';
import CodeEnterForm from '@/modules/game/components/forms/CodeEnterForm';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { useDispatch, useSelector } from 'react-redux';
import { togglePanel } from '../redux/actions';
import { PANEL_INFO } from '@/config/panel';
import EditGameForm from './info/EditGameForm';
import { useState } from 'react';
import { Button, InputNumber, Switch } from 'antd';
import { TID } from '@/config/testIds';
import { STATUS_OFF } from '@/config/presence';
import { setOnline } from '@/modules/presence/redux/actions';
import { setAutoSaveField, setZoom } from '@/modules/game/game-redux/actions';
import { ZOOM_STEPS } from '@/config/ui';
import {
  AUTO_SAVE_FIELD_DELAY_MAX,
  AUTO_SAVE_FIELD_DELAY_MIN,
} from '@/config/game';

const getUrl = () => window.location.href;

const InfoPanel = () => {
  const dispatch = useDispatch();
  const game = useSelector((state) => state.game.game);
  // Переключатель следует за состоянием соединения, а не хранит своё:
  // включён при любом статусе, кроме «выключено», в том числе при ошибке
  const online = useSelector((state) => state.presence.status !== STATUS_OFF);
  const autoSave = useSelector((state) => state.game.autoSave);
  const zoom = useSelector((state) => state.game.zoom);
  const zoomStep = ZOOM_STEPS.indexOf(zoom);
  const [viewMode, setViewMode] = useState(true);

  const { info, can, reloadUserInfo } = useUserContext();
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
                    <a href={getUrl()}>{getUrl()}</a>
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
            {/* Присутствие в игре: открывает сокет и панель со списком тех,
                кто онлайн; доступно любой роли */}
            <tr className="border-b border-gray-300">
              <td className="py-2 px-4">Online:</td>
              <td className="py-2 px-4">
                <Switch
                  size="small"
                  checked={online}
                  onChange={(checked) =>
                    dispatch(setOnline(checked, { reloadUserInfo }))
                  }
                  data-test-id={TID.presence.toggle}
                />
              </td>
            </tr>
            <tr className="border-b border-gray-300">
              <td className="py-2 px-4">Zoom:</td>
              <td className="py-2 px-4">
                <Button
                  size="small"
                  disabled={zoomStep <= 0}
                  onClick={() => dispatch(setZoom(ZOOM_STEPS[zoomStep - 1]))}
                  aria-label="Zoom out"
                  data-test-id={TID.info.zoomOut}
                >
                  −
                </Button>{' '}
                <span data-test-id={TID.info.zoomValue}>
                  {Math.round(zoom * 100)}&nbsp;%
                </span>{' '}
                <Button
                  size="small"
                  disabled={zoomStep === ZOOM_STEPS.length - 1}
                  onClick={() => dispatch(setZoom(ZOOM_STEPS[zoomStep + 1]))}
                  aria-label="Zoom in"
                  data-test-id={TID.info.zoomIn}
                >
                  +
                </Button>
              </td>
            </tr>
            {can(RULE_TURNS_CRUD) && (
              <tr className="border-b border-gray-300">
                <td className="py-2 px-4">Auto Save Field:</td>
                <td className="py-2 px-4">
                  <Switch
                    size="small"
                    checked={autoSave.enabled}
                    onChange={(enabled) =>
                      dispatch(setAutoSaveField({ enabled }))
                    }
                    data-test-id={TID.info.autoSave}
                  />{' '}
                  <InputNumber
                    size="small"
                    min={AUTO_SAVE_FIELD_DELAY_MIN / 1000}
                    max={AUTO_SAVE_FIELD_DELAY_MAX / 1000}
                    precision={0}
                    value={autoSave.delay / 1000}
                    onChange={(seconds) => {
                      if (Number.isFinite(seconds)) {
                        dispatch(setAutoSaveField({ delay: seconds * 1000 }));
                      }
                    }}
                    suffix="s"
                    style={{ width: 80 }}
                    aria-label="Auto Save Field delay, seconds"
                    data-test-id={TID.info.autoSaveDelay}
                  />
                </td>
              </tr>
            )}
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
