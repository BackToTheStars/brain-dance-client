import dynamic from 'next/dynamic'; // позволяет динамически подключать библиотеки в bundle
import { useRouter } from 'next/router';
import { UserProvider } from '@/modules/user/contexts/UserContext';
const Game = dynamic(() => import('@/modules/game/components/Game'), {
  ssr: false,
});

const GamePage = () => {
  const router = useRouter();
  const { hash } = router?.query;
  return (
      <>

      <link href='https://fonts.googleapis.com/css?family=Nunito' rel='stylesheet'></link>

      <div
          style={{
            width: '100vw',
            height: '100vh',
            //background: '#1c1f29',
            overflow: 'hidden',
            position: 'relative',
        }}
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
