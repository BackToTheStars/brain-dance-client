'use client';

import dynamic from 'next/dynamic'; // позволяет динамически подключать библиотеки в bundle
import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  getGameInfo,
  removeGameInfo,
  setGameInfoIntoStorage,
  UserProvider,
} from '@/modules/user/contexts/UserContext';
import Loading from '@/modules/ui/components/common/Loading';
import { TOKEN_REFETCH_DELAY } from '@/config/user';
import { refreshTokenRequest } from '@/modules/game/requests';
const Game = dynamic(() => import('@/modules/game/components/Game'), {
  ssr: false,
});

const GamePage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GamePageInner />
    </Suspense>
  );
};

const GamePageInner = () => {
  const { hash } = useParams();
  const [hashChecked, setHashChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!hash) return;
    const {
      token,
      info,
    } = getGameInfo(hash) || {};
    // const { skipDialog } = info || {};
    if (!token) {
      router.push(`/`);
      return;
    }
    const [_, payload] = token.split('.');

    const {
      exp,
      data: { nickname },
    } = JSON.parse(atob(payload));
    if (exp * 1000 - Date.now() < TOKEN_REFETCH_DELAY) {
      refreshTokenRequest(hash, token, nickname)
        .then((data) => {
          const { info, token } = data;
          setGameInfoIntoStorage(hash, {
            // info: {
            //   ...info,
            //   skipDialog,
            // },
            info,
            token,
          });
          setHashChecked(true);
        })
        .catch((err) => {
          console.log(err);
          removeGameInfo(hash);
          router.push(`/`);
        });
    } else {
      setHashChecked(true);
    }
  }, [hash]);
  return (
    <>
      <div className="circle" />

      <div className="game-bg">
        {!hashChecked ? (
          <Loading />
        ) : (
          <UserProvider hash={hash}>
            <Game hash={hash} />
          </UserProvider>
        )}
      </div>
    </>
  );
};

export default GamePage;
