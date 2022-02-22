import dynamic from 'next/dynamic'; // позволяет динамически подключать библиотеки в bundle
import { useRouter } from 'next/router';
import Head from 'next/head';
import { UserProvider } from '@/modules/user/contexts/UserContext';
import { NotificationsProvider } from '@/modules/ui/contexts/NotificationsContext';
const Game = dynamic(() => import('@/modules/game/components/Game'), { ssr: false });

const GamePage = () => {
  const router = useRouter();
  const { hash } = router?.query;
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <title>Title</title>
        <link rel="stylesheet" href="/quill/quill.snow.css" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css"
        />
        <link rel="stylesheet" href="/js/jquery-ui/jquery-ui.min.css" />
        <script src="/js/jquery.js"></script>
        <script src="/js/jquery.js"></script>
        <script src="/js/jquery-ui/jquery-ui.min.js"></script>
        <script src="/quill/quill.min.js"></script>
        <script src="/js/resize-sensor.js"></script>
      </Head>
      <div
        style={{
          width: '100vw',
          height: '100vh',
          background: '#1c1f29',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {!hash ? (
          <div style={{ color: '#aaa' }}>Loading...</div>
        ) : (
          <UserProvider hash={hash}>
            <NotificationsProvider>
              <Game hash={hash} />
            </NotificationsProvider>
          </UserProvider>
        )}
      </div>
    </>
  );
};

export default GamePage;
