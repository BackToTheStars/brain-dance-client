import { ROLE_GAME_VISITOR, roleOptions } from '@/config/user';
import { loadShortGame } from '@/modules/game/game-redux/actions';
import Loading from '@/modules/ui/components/common/Loading';
import { setGameInfoIntoStorage } from '@/modules/user/contexts/UserContext';
import { Button, Checkbox, Input, Select } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { lobbyEnterGameForRequest } from '../../redux/actions';
import { refreshTokenRequest } from '@/modules/game/requests';

const GameDialog = ({ hash, info, token, myGames, reloadUserInfo }) => {
  const dispatch = useDispatch();
  const game = useSelector((state) => state.game.game);
  const [nickname, setNickname] = useState(info?.nickname || '');
  const [skipDialog, setSkipDialog] = useState(false);
  const router = useRouter();

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const choosedRole = +role;
    // случаи, когда нужно просто открыть игру без применения кода
    if (choosedRole === info.role) {
      if (nickname === info.nickname) {
        // + установить skipDialog при необходимости
        if (skipDialog) {
          setGameInfoIntoStorage(info.hash, {
            info: {
              ...info,
              skipDialog,
            },
            token,
          });
          reloadUserInfo();
          router.push(`/game/view/${hash}`);
        } else {
          // ничего не требуется
          router.push(`/game/view/${hash}`);
        }
      } else {
        // случаи, когда требуется только изменить никнейм
        refreshTokenRequest(hash, token, nickname).then((data) => {
          const { info, token } = data;
          setGameInfoIntoStorage(info.hash, {
            info: {
              ...info,
              skipDialog,
            },
            token,
          });
          reloadUserInfo();
          router.push(`/game/view/${hash}`);
        });
      }
      return;
    }

    // случаи, когда требуется применение кода
    const code = myCodes.find((c) => c.role === choosedRole)?.code || hash;
    const applyCodeAndGoToGame = () => {
      dispatch(lobbyEnterGameForRequest(hash, code, nickname)).then((data) => {
        const { info, token } = data;
        setGameInfoIntoStorage(info.hash, {
          info: {
            ...info,
            skipDialog,
          },
          token,
        });
        reloadUserInfo();
        router.push(`/game/view/${hash}`);
      });
    };

    const maxRole = myCodes.reduce(
      (acc, { role }) => Math.max(acc, role),
      ROLE_GAME_VISITOR,
    );
    // случаи, когда требуется дополнительный вопрос
    // в info содержится роль, которая больше, чем выбранная и в myCodes отсутствует роль owner
    if (
      choosedRole > maxRole &&
      !myCodes.find((c) => c.role === ROLE_GAME_OWNER)
    ) {
      if (confirm(`Owner access will be lost. Do you want to continue?`)) {
        applyCodeAndGoToGame();
      }
      // dispatch(
      //   openModal(MODAL_CONFIRM, {
      //     text: 'Do_you_want_to_apply_the_code?',
      //     callback: applyCodeAndGoToGame,
      //   }),
      // );
    } else {
      applyCodeAndGoToGame();
    }
  };

  useEffect(() => {
    if (!token) return;
    dispatch(loadShortGame(hash));
  }, [token]);

  return (
    <div className="flex-center h-screen">
      <div className="flex gap-2">
        <div className="w-[400px] border border-solid border-gray-300 rounded-md p-4">
          {/* {game ? ( */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <h2 className="text-2xl text-center">
              {game?.name || <Loading />}
            </h2>
            <div className="flex gap-3">
              <div className="w-1/2 flex flex-col gap-2">
                <label>nickname</label>
                <Input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
              </div>
              <div className="w-1/2 flex flex-col gap-2">
                <label>role</label>
                <Select
                  value={role}
                  onChange={(value) => setRole(value)}
                  options={availableRoleOptions}
                />
              </div>
            </div>
            <div
              className="flex gap-2 cursor-pointer"
              onClick={() => setSkipDialog(!skipDialog)}
            >
              <Checkbox
                checked={skipDialog}
                // onChange={(e) => setSkipDialog(e.target.checked)}
              />
              <div>Skip this dialog next time</div>
            </div>
            {/* game.description and game.image */}
            <div className="flex justify-end">
              <Button htmlType="submit">Go to the Game</Button>
            </div>
          </form>
          {/* ) : (
            <Loading />
          )} */}
        </div>
        {/* <pre className="w-[400px]  max-h-[500px] overflow-y-auto">
          {JSON.stringify({ hash, info, token, myGames }, null, 2)}
        </pre> */}
      </div>
    </div>
  );
};

export default GameDialog;
