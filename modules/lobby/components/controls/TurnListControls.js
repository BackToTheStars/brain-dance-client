import { SIZE_SM } from '@/config/ui/size';
import { DropdownList } from '../ui/DropdownList';
import { contentTypes } from '@/config/lobby/contentType';
import {
  changeRequestSettings,
  switchMode,
} from '@/modules/lobby/redux/actions';
import {
  ApartmentOutlined,
  BookOutlined,
  ClockCircleOutlined,
  PushpinFilled,
  PushpinOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { IntButton as Button } from '@/ui/button';
import { MODAL_ACCESS_GAMES } from '@/config/lobby/modal';
import { openModal } from '@/modules/ui/redux/actions';
import { useTranslations } from 'next-intl';

const GroupParams = ({ children }) => {
  return <div className="base-group p-2 w-1/2">{children}</div>;
};

const TurnListControls = () => {
  const t = useTranslations('Lobby.parametersPanel');
  const mode = useSelector((s) => s.lobby.mode);
  const { gameLimit, turnLimit, pinned } = useSelector(
    (s) => s.lobby.requestSettings,
  );
  const dispatch = useDispatch();
  const changeGameLimit = (delta) => {
    if (gameLimit + delta < 1) return;
    if (gameLimit + delta > 20) return;
    dispatch(changeRequestSettings('gameLimit', gameLimit + delta));
  };

  const changeTurnLimit = (delta) => {
    if (turnLimit + delta < 1) return;
    if (turnLimit + delta > 20) return;
    dispatch(changeRequestSettings('turnLimit', turnLimit + delta));
  };

  const changePinned = () => {
    dispatch(changeRequestSettings('pinned', !pinned));
  };

  const btnStyle =
    'w-[30px] h-[30px] border border-main rounded-btn-border leading-[1] flex items-center justify-center select-none';
  // элементы управления списком ходов (фильтрация, позже - сортировка и поиск)
  return (
    <div className="turn-list-controls">
      <div className="flex justify-between items-center mb-3">
        <div className="text-lg font-semibold">{t('Request_parameters')}</div>
      </div>
      <div className="cursor-pointer py-3 border-y dark:border-white border-dark-light dark:border-opacity-10 border-opacity-10">
        <div className="flex-1 flex gap-2">
          <GroupParams>
            <Button
              className={mode === 'byGame' ? 'active' : ''}
              size="sm"
              onClick={() => dispatch(switchMode('byGame'))}
            >
              <ApartmentOutlined /> {t('By_game')}
            </Button>
            <div className="mt-2 cursor-pointer py-2 border-y dark:border-white border-dark-light dark:border-opacity-10 border-opacity-10 flex justify-between items-center flex-wrap">
              <div className="text-dark w-full">{t('Game_limit')}</div>
              <div className="flex gap-x-2 items-center w-[120px]">
                <div
                  onClick={() => changeGameLimit(-1)}
                  className={`${btnStyle}`}
                >
                  -
                </div>
                <div className="w-[36px] h-full text-center font-medium">
                  {gameLimit}
                </div>
                <div
                  onClick={() => changeGameLimit(1)}
                  className={`${btnStyle}`}
                >
                  +
                </div>
              </div>
            </div>
            <div className="cursor-pointer py-2 border-y dark:border-white border-dark-light dark:border-opacity-10 border-opacity-10 flex justify-between items-center flex-wrap">
              <div className="text-dark w-full">{t('Turn_limit')}</div>
              <div className="flex gap-x-2 items-center w-[120px]">
                <div
                  onClick={() => changeTurnLimit(-1)}
                  className={`${btnStyle}`}
                >
                  -
                </div>
                <div className="w-[36px] h-full text-center font-medium">
                  {turnLimit}
                </div>
                <div
                  onClick={() => changeTurnLimit(1)}
                  className={`${btnStyle}`}
                >
                  +
                </div>
              </div>
            </div>
          </GroupParams>
          <GroupParams>
            <div className="flex gap-2">
              <Button
                className={mode === 'chrono' ? 'active' : ''}
                size="sm"
                onClick={() => dispatch(switchMode('chrono'))}
              >
                <ClockCircleOutlined /> {t('Chrono')}
              </Button>
              <Button
                className={pinned ? 'active' : ''}
                size="sm"
                onClick={changePinned}
              >
                {pinned ? <PushpinFilled /> : <PushpinOutlined />}
              </Button>
            </div>
          </GroupParams>
        </div>
      </div>
      <div className="flex gap-3 py-3">
        <div>
          <Button
            size="sm"
            onClick={() => dispatch(openModal(MODAL_ACCESS_GAMES))}
          >
            <BookOutlined /> {t('Favorite_games')}
          </Button>
        </div>
        <div className="cursor-pointer">
          <DropdownList
            title={t('Content_types')}
            size={SIZE_SM}
            options={contentTypes}
            value={contentTypes[0].value}
            onChange={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

export default TurnListControls;
