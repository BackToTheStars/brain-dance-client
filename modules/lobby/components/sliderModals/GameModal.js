import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { ContentButton as Button } from '@/ui/button';
import { LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { VerticalSplit } from '../elements/VerticalSplit';
import { useRouter } from 'next/navigation';
import {
  ROLES,
  ROLE_GAME_VISITOR,
  RULE_GAME_EDIT,
  roleOptions,
} from '@/config/user';
import {
  addGameCode,
  removeGameCode,
  removeGameFromList,
} from '@/modules/settings/redux/actions';
import Loading from '@/modules/ui/components/common/Loading';
import { closeModal, openModal } from '@/modules/ui/redux/actions';
import { MODAL_CONFIRM } from '@/config/lobby/modal';
import {
  getGameInfo,
  removeGameInfo,
} from '@/modules/user/contexts/UserContext';
import { addCodeRequest, deleteGameRequest } from '@/modules/game/requests';
import { lobbyEnterGameForRequest } from '../../redux/actions';
import { useMainLayoutContext } from '../layout/MainLayoutContext';
import { useSlider } from '../layout/useSlider';
import { useTranslations } from 'next-intl';
import { SIZE_SM } from '@/config/ui/size';
import { DropdownList } from '../ui/DropdownList';

const CreateCodeForm = ({ codeData, hash }) => {
  const t = useTranslations('Lobby.game');
  const [role, setRole] = useState(String(ROLE_GAME_VISITOR));
  const dispatch = useDispatch();
  return (
    <div className="flex gap-2 pb-2">
      <DropdownList
        value={role}
        options={roleOptions}
        onChange={(value) => setRole(value)}
      />
      <Button
        size={SIZE_SM}
        onClick={(e) => {
          e.preventDefault();
          dispatch(
            lobbyEnterGameForRequest(hash, codeData.code, codeData.nickname),
          ).then(() => {
            addCodeRequest({ role: +role }).then((data) => {
              const { hash: code } = data.item;
              dispatch(
                addGameCode({
                  hash,
                  nickname: ROLES[role].name,
                  role: +role,
                  code,
                }),
              );
            });
          });
        }}
      >
        {t('Add_Code')}
      </Button>
    </div>
  );
};

const CodesBlock = ({ codeData, codes, hash, can }) => {
  const t = useTranslations('Lobby.game');
  const dispatch = useDispatch();
  const [gameInfo, setGameInfo] = useState(null);

  const reloadGameInfo = () => setGameInfo(getGameInfo(hash));

  useEffect(() => {
    reloadGameInfo();
  }, [hash]);

  return (
    <div>
      {!!gameInfo && (
        <div className="mb-3">
          <h2 className="mb-2">{t('Game_data')}</h2>
          <div className="flex gap-2 items-center">
            {gameInfo.info.nickname} {ROLES[gameInfo.info.role].name}
            <Button
              size={SIZE_SM}
              onClick={() => {
                removeGameInfo(hash);
                reloadGameInfo();
              }}
            >
              {t('Logout')}
            </Button>
          </div>
          {/* <pre>{JSON.stringify(gameInfo, null, 2)}</pre> */}
        </div>
      )}
      {!!codes.length && (
        <div className="flex flex-col mb-3">
          {/* <h2>Game codes</h2> */}
          <table className="border border-gray-700">
            <thead>
              <tr className="bg-gray-800">
                <th>{t('Nickname')}</th>
                <th>{t('Code')}</th>
                <th>{t('Role')}</th>
                <th className="w-[150px]"></th>
              </tr>
            </thead>
            <tbody>
              {codes.map((codeData, i) => (
                <tr key={codeData.code} className={i % 2 ? 'bg-gray-700' : ''}>
                  <td>{codeData.nickname}</td>
                  <td>{codeData.code}</td>
                  <td>{ROLES[codeData.role]?.name}</td>
                  <td>
                    <div className="flex flex-col gap-2">
                      {codeData.role !== gameInfo?.info?.role &&
                        codeData.nickname !== gameInfo?.info?.nickname && (
                          <Button
                            size={SIZE_SM}
                            className="justify-center"
                            onClick={() => {
                              dispatch(
                                lobbyEnterGameForRequest(
                                  hash,
                                  codeData.code,
                                  codeData.nickname,
                                ),
                              ).then(() => reloadGameInfo());
                            }}
                          >
                            {t('Login')}
                          </Button>
                        )}
                      <Button
                        size={SIZE_SM}
                        className="justify-center"
                        onClick={() => {
                          dispatch(
                            openModal(MODAL_CONFIRM, {
                              text: 'Remove_game_code',
                              callback: () => {
                                dispatch(
                                  removeGameCode({ hash, code: codeData.code }),
                                );
                                dispatch(closeModal());
                              },
                            }),
                          );
                        }}
                      >
                        {t('Remove_code')}
                      </Button>
                    </div>
                  </td>
                  {/* <pre>{JSON.stringify(codeData, null, 2)}</pre> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {can(RULE_GAME_EDIT) && (
        <div className="mb-3">
          <CreateCodeForm codeData={codeData} hash={hash} />
        </div>
      )}
    </div>
  );
};

const GameModalContent = memo(({ hash, closeModal = () => {} }) => {
  const t = useTranslations('Lobby.game');
  const dispatch = useDispatch();
  const myGames = useSelector((state) => state.settings.games);
  const router = useRouter();
  const game = useSelector((state) =>
    state.lobby.games.find((g) => g.hash === hash),
  );
  const { public: isPublic, name, image, turnsCount, description } = game || {};
  const {
    can,
    existsInList,
    role,
    codeData,
    codes = [],
  } = useMemo(() => {
    const info = myGames.find((g) => g.hash === hash);
    if (!info) {
      return {
        existsInList: false,
        role: ROLE_GAME_VISITOR,
        can: (rule) => ROLES[ROLE_GAME_VISITOR].rules.includes(rule),
      };
    }
    const mainRole = info.codes.reduce(
      (acc, codeData) => (codeData.role > acc ? codeData.role : acc),
      ROLE_GAME_VISITOR,
    );
    const codeData = info.codes.find((codeData) => codeData.role === mainRole);
    return {
      existsInList: true,
      role: mainRole,
      codeData,
      codes: info.codes,
      can: (rule) => ROLES[mainRole].rules.includes(rule),
    };
  }, [myGames, hash]);
  if (!name) return <Loading />;
  return (
    <>
      <div className="flex items-center gap-x-4">
        <div className="w-[30px] h-[30px] flex-[0_0_auto] inline-flex items-center justify-center rounded-btn-border border-2 border-main bg-main bg-opacity-10">
          {isPublic ? (
            <UnlockOutlined className="text-[18px] dark:text-light text-dark" />
          ) : (
            <LockOutlined className="text-[18px] dark:text-light text-dark" />
          )}
        </div>
        <div className="text-xl font-semibold w-full pe-10 leading-[1.2] dark:text-white text-dark">
          {name}
        </div>
      </div>
      <div className="overflow-y-auto">
        <div className="mt-4">
          <div className="relative w-full">
            {!!image && (
              <img
                className="w-full h-full object-cover object-center rounded"
                src={`${image}`}
                alt="image"
              />
            )}
            <div className="w-full h-auto flex gap-x-1 px-3">
              <div className="w-full py-2 text-center bg-main-dark bg-opacity-90 rounded">
                <div className="text-center font-semibold">{t('Players')}</div>
                {Math.ceil(turnsCount / 20)}
              </div>
              <div className="w-full py-2 text-center bg-main-dark bg-opacity-90 rounded">
                <div className="text-center font-semibold">{t('Turns')}</div>
                {turnsCount}
              </div>
              <div className="w-full py-2 text-center bg-main-dark bg-opacity-90 rounded">
                <div className="text-center font-semibold">{t('Views')}</div>
                {Math.round(turnsCount * 17)}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6">{!!description && description}</div>
        <div className="flex-1" />
        <CodesBlock codeData={codeData} codes={codes} hash={hash} can={can} />
        <div className="mt-auto gap-2 flex">
          {existsInList && (
            <Button
              size="sm"
              onClick={() => {
                dispatch(
                  openModal(MODAL_CONFIRM, {
                    text: 'Remove_item_from_my_games',
                    callback: () => {
                      dispatch(removeGameFromList(hash));
                      closeModal();
                    },
                  }),
                );
              }}
            >
              {t('Remove_from_List')}
            </Button>
          )}
          {can(RULE_GAME_EDIT) && (
            <Button
              size="sm"
              onClick={() => {
                dispatch(
                  openModal(MODAL_CONFIRM, {
                    text: 'Delete_the_game_permanently',
                    callback: () => {
                      dispatch(
                        lobbyEnterGameForRequest(
                          hash,
                          codeData.code,
                          codeData.nickname,
                        ),
                      ).then(() => {
                        deleteGameRequest(hash).then(() => {
                          dispatch(removeGameFromList(hash));
                          removeGameInfo(hash);
                          closeModal();
                        });
                      });
                    },
                  }),
                );
              }}
            >
              {t('Delete_game')}
            </Button>
          )}
          <Button size="sm" onClick={() => router.push(`/game?hash=${hash}`)}>
            {t('Open_game')}
          </Button>
        </div>
      </div>
    </>
  );
});

const minWidthCallback = () => 400;
const maxWidthCallback = () => 800;
const GameModal = ({ params, closeModal = () => {} }) => {
  const modalRef = useRef();
  const { hash } = params;
  const { sliderWidth, setSliderWidth } = useMainLayoutContext();

  const { move, setIsDragging } = useSlider(
    sliderWidth,
    setSliderWidth,
    modalRef?.current?.parentNode,
    minWidthCallback,
    maxWidthCallback,
  );

  const leftSideStyle = useMemo(() => {
    return {
      maxWidth: '100%',
      width: sliderWidth ? `${sliderWidth}px` : '50%',
    };
  }, [sliderWidth]);

  return (
    <>
      <div
        className="flex flex-col h-full dark:bg-dark-light bg-light rounded p-4 relative"
        style={leftSideStyle}
        ref={modalRef}
      >
        <GameModalContent hash={hash} closeModal={closeModal} />
      </div>
      <VerticalSplit
        move={move}
        setIsDragging={setIsDragging}
        extraClasses="game-modal__split"
      />
    </>
  );
};

export default GameModal;
