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

  return (
    <div className="game-bg">
      {!hash ? (
        <Loading />
      ) : (
        <UserProvider hash={hash}>
          <GameDialogPage hash={hash} />
        </UserProvider>
      )}
    </div>
  );
};

const GameDialogPage = ({ hash }) => {
  const dispatch = useDispatch();
  const [myGamesLoaded, setMyGamesLoaded] = useState(false);
  const myGames = useSelector((state) => state.settings.games);
  const { info, token, reloadUserInfo } = useUserContext();
  const router = useRouter();
  useEffect(() => {
    if (!myGamesLoaded) return;
    if (info.skipDialog) {
      router.push(`/game/view/${hash}`);
      return;
    }
  }, [hash, info, token, myGames, myGamesLoaded]);

  useEffect(() => {
    if (myGamesLoaded) return;
    if (myGames.length) {
      setMyGamesLoaded(true);
      return;
    }
    dispatch(loadSettings());
    setTimeout(() => {
      setMyGamesLoaded(true);
    }, 300);
  }, [myGames]);

  if (!myGamesLoaded || info?.skipDialog) {
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
