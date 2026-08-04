import { ROLE_GAME_VISITOR, roleOptions } from '@/config/user';
import { loadShortGame } from '@/modules/game/game-redux/actions';
import Loading from '@/modules/ui/components/common/Loading';
import { setGameInfoIntoStorage } from '@/modules/user/contexts/UserContext';
import { Button, Checkbox, Input, Select } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { lobbyEnterGameForRequest } from '../../redux/actions';
import { refreshTokenRequest } from '@/modules/game/requests';
import { useTranslations } from 'next-intl';
import { TID } from '@/config/testIds';

const GameDialog = ({ hash, info, token, myGames, reloadUserInfo }) => {
  const dispatch = useDispatch();
  const game = useSelector((state) => state.game.game);
  const t = useTranslations('Lobby');
  const [nickname, setNickname] = useState(info?.nickname || '');
  // const [skipDialog, setSkipDialog] = useState(false);
  const router = useRouter();
  // ход из расшаренной ссылки (?turn=) — донести до страницы игры
  const searchParams = useSearchParams();
  const focusTurnId = searchParams.get('turn');
  const gameViewUrl = `/game/view/${hash}${
    focusTurnId ? `?turn=${focusTurnId}` : ''
  }`;

  const [role, setRole] = useState(String(info?.role || ROLE_GAME_VISITOR));
  const myCodes = useMemo(() => {
    if (!myGames) return [];
    const myGame = myGames.find((g) => g.hash === hash);
    if (!myGame) return [];
    return myGame.codes;
  }, [myGames, hash]);

  const availableRoleOptions = useMemo(() => {
    const roles = {
      [ROLE_GAME_VISITOR]: true, // @todo: if game accessLevel is 'link'
    };
    if (info?.role) {
      roles[info?.role] = true;
    }
    if (myCodes) {
      for (const code of myCodes) {
        roles[code.role] = true;
      }
    }
    return roleOptions.filter((option) => roles[option.value]);
  }, [info, myCodes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const choosedRole = +role;
    // случаи, когда нужно просто открыть игру без применения кода
    if (choosedRole === info.role) {
      if (nickname === info.nickname) {
        // + установить skipDialog при необходимости
        let code = myCodes.find((c) => c.role === choosedRole)?.code;
        if (!code && choosedRole === ROLE_GAME_VISITOR) {
          code = hash;
          const prm = new Promise((resolve) => {
            dispatch(lobbyEnterGameForRequest(hash, hash, 'Guest')).then(() => {
              // reloadGameInfo();
              resolve();
            });
          });
          await prm;
        }
        // if (skipDialog) {
        //   setGameInfoIntoStorage(info.hash, {
        //     info: {
        //       ...info,
        //       skipDialog,
        //     },
        //     token,
        //   });
        //   reloadUserInfo();
        //   router.push(gameViewUrl);
        // } else {
        // ничего не требуется
        router.push(gameViewUrl);
        // }
      } else {
        // случаи, когда требуется только изменить никнейм
        refreshTokenRequest(hash, token, nickname).then((data) => {
          const { info, token } = data;
          setGameInfoIntoStorage(info.hash, {
            info,
            // info: {
            //   ...info,
            //   skipDialog,
            // },
            token,
          });
          reloadUserInfo();
          router.push(gameViewUrl);
        });
      }
      return;
    }
    // случаи, когда требуется применение кода
    let code = myCodes.find((c) => c.role === choosedRole)?.code;
    if (!code && choosedRole === ROLE_GAME_VISITOR) {
      code = hash;
      const prm = new Promise((resolve) => {
        dispatch(
          lobbyEnterGameForRequest(
            hash,
            hash,
            'Guest',
          ),
        ).then(() => {
          // reloadGameInfo();
          resolve();
        })
      });
      await prm;
    }
    
    const applyCodeAndGoToGame = () => {
      dispatch(lobbyEnterGameForRequest(hash, code, nickname)).then((data) => {
        const { info, token } = data;
        setGameInfoIntoStorage(info.hash, {
          info,
          // info: {
          //   ...info,
          //   skipDialog,
          // },
          token,
        });
        reloadUserInfo();
        router.push(gameViewUrl);
      });
    };

    const maxRole = myCodes.reduce(
      (acc, { role }) => Math.max(acc, role),
      ROLE_GAME_VISITOR,
    );
    if (
      choosedRole > maxRole &&
      !myCodes.find((c) => c.role === ROLE_GAME_OWNER)
    ) {
      if (confirm(`Owner access will be lost. Do you want to continue?`)) {
        applyCodeAndGoToGame();
      }
    } else {
      applyCodeAndGoToGame();
    }
  };

  useEffect(() => {
    // if (!token) return;
    dispatch(loadShortGame(hash));
  // }, [token]);
  }, []);

  return (
    <div className="flex-center h-screen">
      <div className="flex gap-2">
        <div className="w-[400px] border border-solid border-gray-300 rounded-md p-4">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <h2 className="text-2xl text-center">
              {game?.name || <Loading />}
            </h2>
            <div className="flex gap-3">
              <div className="w-1/2 flex flex-col gap-2">
                <label>{t('nickname')}</label>
                <Input
                  data-test-id={TID.gameDialog.nickname}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
              </div>
              <div className="w-1/2 flex flex-col gap-2">
                <label>{t('role')}</label>
                <Select
                  data-test-id={TID.gameDialog.role}
                  value={role}
                  onChange={(value) => setRole(value)}
                  options={availableRoleOptions}
                />
              </div>
            </div>
            {/* <div
              className="flex gap-2 cursor-pointer"
              onClick={() => setSkipDialog(!skipDialog)}
            >
              <Checkbox
                checked={skipDialog}
                // onChange={(e) => setSkipDialog(e.target.checked)}
              />
              <div>{t('gameDialog.Skip_this_dialog_next_time')}</div>
            </div> */}
            {/* game.description and game.image */}
            <div className="flex justify-end">
              <Button htmlType="submit" data-test-id={TID.gameDialog.submit}>
                {t('gameDialog.Go_to_the_game')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GameDialog;
