import { ROLES, ROLE_GAME_VISITOR, roleOptions } from '@/config/user';
import { loadShortGame } from '@/modules/game/game-redux/actions';
import Loading from '@/modules/ui/components/common/Loading';
import {
  removeGameInfo,
  setGameInfoIntoStorage,
} from '@/modules/user/contexts/UserContext';
import { Button, Checkbox, Input, Select } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { lobbyEnterGameForRequest } from '../../redux/actions';
import { gameCodeUrl, gameViewUrl } from '../../helpers/shareParams';
import { refreshTokenRequest } from '@/modules/game/requests';
import { useTranslations } from 'next-intl';
import { TID } from '@/config/testIds';
import AccessExpiredModal from '@/modules/user/components/AccessExpiredModal';

const GameDialog = ({ hash, info, token, myGames, reloadUserInfo }) => {
  const dispatch = useDispatch();
  const game = useSelector((state) => state.game.game);
  const t = useTranslations('Lobby');
  const [nickname, setNickname] = useState(info?.nickname || '');
  // const [skipDialog, setSkipDialog] = useState(false);
  const router = useRouter();
  // ход из расшаренной ссылки (?turn=) и экскурсия из ссылки-приглашения
  // (?tour=) — донести до страницы игры
  const searchParams = useSearchParams();
  const focusTurnId = searchParams.get('turn');
  const tourId = searchParams.get('tour');
  const viewUrl = gameViewUrl(hash, { focusTurnId, tourId });

  const [role, setRole] = useState(String(info?.role || ROLE_GAME_VISITOR));
  // отказ обновления токена показываем прямо в диалоге, а не alert'ом
  const [accessError, setAccessError] = useState('');
  const [gameNotFound, setGameNotFound] = useState(false);
  const [expired, setExpired] = useState(false);
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

  // Обновление токена может не пройти: подпись подделана или ключ сервера
  // сменился. Тогда сохранённый доступ негоден — снимаем его и остаёмся в
  // диалоге, чтобы код можно было ввести заново.
  const handleRefreshFailure = (message) => {
    removeGameInfo(hash);
    reloadUserInfo();
    setAccessError(message || t('gameDialog.Access_update_failed'));
  };

  const applyCodeAndGoToGame = (code) => {
    dispatch(lobbyEnterGameForRequest(hash, code, nickname))
      .then((data) => {
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
        router.push(viewUrl);
      })
      .catch((message) =>
        setAccessError(
          typeof message === 'string'
            ? message
            : t('gameDialog.Access_update_failed'),
        ),
      );
  };

  // Истёкший токен не продлить: запись снимается при любом выборе.
  const backToLobby = () => {
    removeGameInfo(hash);
    window.location.assign('/');
  };
  const stayVisitor = () => {
    removeGameInfo(hash);
    reloadUserInfo();
    setExpired(false);
    setRole(String(ROLE_GAME_VISITOR));
    applyCodeAndGoToGame(
      myCodes.find((c) => c.role === ROLE_GAME_VISITOR)?.code || hash,
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAccessError('');
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
        //   router.push(viewUrl);
        // } else {
        // ничего не требуется
        router.push(viewUrl);
        // }
      } else if (!token) {
        // Гость по ссылке: токена нет, /codes/refresh ответит 401 — входим по коду
        // (у посетителя код — это хеш игры).
        const guestCode =
          myCodes.find((c) => c.role === choosedRole)?.code ||
          (choosedRole === ROLE_GAME_VISITOR ? hash : null);
        if (!guestCode) {
          setAccessError(t('gameDialog.Access_update_failed'));
          return;
        }
        applyCodeAndGoToGame(guestCode);
      } else {
        // случаи, когда требуется только изменить никнейм
        refreshTokenRequest(hash, token, nickname)
          .then((data) => {
            if (data.expired) {
              setExpired(true);
              return;
            }
            if (!data.success) {
              handleRefreshFailure(data.message);
              return;
            }
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
            router.push(viewUrl);
          })
          .catch(() => setAccessError(t('gameDialog.Access_update_offline')));
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

    // Предупреждение о потере доступа. Вход другим кодом перезаписывает
    // game_<hash>, и если текущая роль выше всех сохранённых кодов, вернуть её
    // будет нечем. Прежнее условие (choosedRole > maxRole) не выполнялось
    // никогда — в списке ролей есть только visitor, текущая роль и роли своих
    // кодов, а равенство с текущей отсечено выше — и падало ReferenceError на
    // неимпортированном ROLE_GAME_OWNER.
    const maxRole = myCodes.reduce(
      (acc, { role }) => Math.max(acc, role),
      ROLE_GAME_VISITOR,
    );
    const currentRole = info?.role || ROLE_GAME_VISITOR;
    if (currentRole > maxRole && choosedRole < currentRole) {
      const roleName = ROLES[currentRole]?.name || '';
      if (
        confirm(`${roleName} access will be lost. Do you want to continue?`)
      ) {
        applyCodeAndGoToGame(code);
      }
    } else {
      applyCodeAndGoToGame(code);
    }
  };

  useEffect(() => {
    // if (!token) return;
    dispatch(loadShortGame(hash)).catch(() => setGameNotFound(true));
  // }, [token]);
  }, []);

  // В ?hash= старых ссылок лежит код: входим им только по явному нажатию.
  if (gameNotFound) {
    return (
      <div className="flex-center h-screen">
        <div
          className="w-[400px] border border-solid border-gray-300 rounded-md p-4 flex flex-col gap-4"
          data-test-id={TID.gameDialog.notFound}
        >
          <h2 className="text-2xl text-center">
            {t('gameDialog.Game_not_found')}
          </h2>
          <div>{t('gameDialog.Game_not_found_hint')}</div>
          <div className="flex justify-end gap-2">
            <Button
              data-test-id={TID.gameDialog.toLobby}
              onClick={() => window.location.assign('/')}
            >
              {t('gameDialog.Go_to_lobby')}
            </Button>
            <Button
              data-test-id={TID.gameDialog.openAsCode}
              onClick={() =>
                router.replace(gameCodeUrl(hash, { focusTurnId, tourId }))
              }
            >
              {t('gameDialog.Open_as_access_code')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
            {accessError && (
              <div className="text-red-500 text-sm">{accessError}</div>
            )}
            <div className="flex justify-end">
              <Button htmlType="submit" data-test-id={TID.gameDialog.submit}>
                {t('gameDialog.Go_to_the_game')}
              </Button>
            </div>
          </form>
        </div>
      </div>
      <AccessExpiredModal
        open={expired}
        onLobby={backToLobby}
        onStay={stayVisitor}
      />
    </div>
  );
};

export default GameDialog;
