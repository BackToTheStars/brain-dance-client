'use client';
import '@/themes/v1/scss/style.scss';

import dynamic from 'next/dynamic'; // позволяет динамически подключать библиотеки в bundle
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { UserProvider } from '@/modules/user/contexts/UserContext';
const Game = dynamic(() => import('@/modules/game/components/Game'), {
  ssr: false,
});

const GamePage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GamePageInner />
    </Suspense>
  );
}

const GamePageInner = () => {
  const searchParams = useSearchParams();
  const hash = searchParams.get('hash');
  return (
      <>

      <link href='https://fonts.googleapis.com/css?family=Nunito' rel='stylesheet'></link>

      <div className="circle"></div>

      <div
          style={{
            width: '100vw',
            height: '100vh',
            //background: '#1c1f29',
            overflow: 'hidden',
            position: 'relative',

              }}
            className="game-bg"
          >
        {!hash ? (
          <div style={{ color: '#aaa' }}>Loading...</div>
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
