'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Loading from '@/modules/ui/components/common/Loading';
import {
  UserProvider,
  useUserContext,
} from '@/modules/user/contexts/UserContext';
import { useDispatch, useSelector } from 'react-redux';
import { loadSettings } from '@/modules/settings/redux/actions';
import GameDialog from '@/modules/lobby/components/page/GameDialog';
import { lobbyEnterGameWithConfirm } from '@/modules/lobby/redux/actions';

const GAME_ID_HASH_LENGTH = 3;

const GamePage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GamePageInner />
    </Suspense>
  );
};

const GamePageInner = () => {
  const searchParams = useSearchParams();
  const hash = searchParams.get('hash');
  // ход из расшаренной ссылки (?turn=) — не терять при редиректах
  const focusTurnId = searchParams.get('turn');

  return (
    <div className="game-bg">
      {!hash ? (
        <Loading />
      ) : (
        <UserProvider hash={hash}>
          <GameDialogPage hash={hash} focusTurnId={focusTurnId} />
        </UserProvider>
      )}
    </div>
  );
};

const GameDialogPage = ({ hash, focusTurnId }) => {
  const dispatch = useDispatch();
  const [myGamesLoaded, setMyGamesLoaded] = useState(false); // @todo: перенести в store
  const myGames = useSelector((state) => state.settings.games);
  const { info, token, reloadUserInfo } = useUserContext();
  
  const router = useRouter();
  
  useEffect(() => {
    if (!hash || hash.length === GAME_ID_HASH_LENGTH) return;
    if (!myGamesLoaded) return;
    // обработка случая, когда hash является кодом с ролью
    // @todo: изменить при переходе к произвольной длине hash
    const existedGame = myGames.find((g) => {
      for (const codeObj of g.codes) {
        if (codeObj.code === hash) {
          return true;
        }
      }
      return false;
    });
    if (existedGame) {
      router.push(
        `/game?hash=${existedGame.hash}${
          focusTurnId ? `&turn=${focusTurnId}` : ''
        }`,
      );
      return;
    }
    dispatch(lobbyEnterGameWithConfirm(hash, 'user', focusTurnId)).catch(
      (msg) => {
        alert(msg);
      },
    );
  }, [hash, myGames, myGamesLoaded]);

  // useEffect(() => {
  //   if (!myGamesLoaded) return;
  //   if (info.skipDialog) {
  //     router.push(`/game/view/${hash}`);
  //     return;
  //   }
  // }, [hash, info, token, myGames, myGamesLoaded]);

  useEffect(() => {
    dispatch(loadSettings());
    setTimeout(() => {
      setMyGamesLoaded(true);
    }, 300)
  }, [])

  // if (!myGamesLoaded || info?.skipDialog) {
  if (!myGamesLoaded) {
    return <Loading />;
  }

  return (
    <div className="game-dialog">
      <GameDialog
        hash={hash}
        info={info}
        token={token}
        myGames={myGames}
        reloadUserInfo={reloadUserInfo}
      />
    </div>
  );
};

export default GamePage;
