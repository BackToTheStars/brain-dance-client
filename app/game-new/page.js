'use client';

import dynamic from 'next/dynamic'; // позволяет динамически подключать библиотеки в bundle
import { useSearchParams } from 'next/navigation';
import { UserProvider } from '@/modules/user/contexts/UserContext';
const Game = dynamic(() => import('@/modules/game-new/components/Game'), {
  ssr: false,
});

const GamePage = () => {
  const searchParams = useSearchParams();
  const hash = searchParams.get('hash');
  return (
    <>
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
