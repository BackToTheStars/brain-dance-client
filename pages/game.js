import dynamic from 'next/dynamic'; // позволяет динамически подключать библиотеки в bundle
import Head from 'next/head'; // в head засовываем всё что было в head index.html
import { UI_Provider } from '../components/contexts/UI_Context';
import { UserProvider } from '../components/contexts/UserContext';
import { InteractionProvider } from '../components/contexts/InteractionContext';
import { TurnProvider } from '../components/contexts/TurnContext';
import { useRouter } from 'next/router';
import { Fragment } from 'react';

const Game = dynamic(() => import('../components/Game'), { ssr: false });
const TurnContext = dynamic(
  () => import('../components/contexts/TurnContext'),
  { ssr: false }
);
// ssr = server side rendering
const GamePage = () => {
  const router = useRouter();
  const { hash } = router.query;

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <title>Title</title>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.css"
        />
        <link rel="stylesheet" href="/quill/quill.snow.css" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css"
        />
        {/* <link rel="stylesheet" href="css/modal.css" />
        <link rel="stylesheet" href="css/style.css" /> */}

        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
        <script
          src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js"
          integrity="sha256-VazP97ZCwtekAsvgPBSUwPFKdrwD3unUfSGVYrahUqU="
          crossOrigin="anonymous"
        ></script>
        <script src="/quill/quill.min.js"></script>
      </Head>
      {!hash ? (
        'Loading...'
      ) : (
        <UserProvider hash={hash} timecode={router.query.timecode}>
          <UI_Provider>
            <TurnProvider>
              <InteractionProvider>
                <Game />
              </InteractionProvider>
            </TurnProvider>
          </UI_Provider>
        </UserProvider>
      )}
    </>
  );
};

export default GamePage;
