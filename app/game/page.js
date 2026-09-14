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
import CodeEnterDialog from '@/modules/lobby/components/page/CodeEnterDialog';
import { gameEntryUrl } from '@/modules/lobby/helpers/shareParams';

const GamePage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <GamePageInner />
    </Suspense>
  );
};

// Адрес игры приходит только в ?hash=, код доступа — только в ?code=.
const GamePageInner = () => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const hash = searchParams.get('hash');
  const code = searchParams.get('code');
  // ход из расшаренной ссылки (?turn=) и экскурсия из ссылки-приглашения
  // (?tour=) — не терять при редиректах
  const focusTurnId = searchParams.get('turn');
  const tourId = searchParams.get('tour');
  const [myGamesLoaded, setMyGamesLoaded] = useState(false); // @todo: перенести в store

  useEffect(() => {
    // loadSettings — синхронный thunk поверх localStorage: после dispatch список
    // игр уже в store, ждать таймером нечего.
    dispatch(loadSettings());
    setMyGamesLoaded(true);
  }, []);

  let content = <Loading />;
  if (myGamesLoaded && code) {
    content = (
      <CodeEntryPage
        key={code}
        code={code}
        focusTurnId={focusTurnId}
        tourId={tourId}
      />
    );
  } else if (myGamesLoaded && hash) {
    content = (
      <UserProvider key={hash} hash={hash}>
        <GameDialogPage hash={hash} />
      </UserProvider>
    );
  }

  return <div className="game-bg">{content}</div>;
};

const CodeEntryPage = ({ code, focusTurnId, tourId }) => {
  const myGames = useSelector((state) => state.settings.games);
  const [unknownCode, setUnknownCode] = useState(false);
  const router = useRouter();

  // Решается один раз: вход по коду сам добавляет код в список игр.
  useEffect(() => {
    // код уже может быть среди сохранённых доступов — тогда просто на адрес игры
    const existedGame = myGames.find((g) =>
      g.codes.some((codeObj) => codeObj.code === code),
    );
    if (existedGame) {
      router.replace(gameEntryUrl(existedGame.hash, { focusTurnId, tourId }));
      return;
    }
    // код неизвестен: спрашиваем ник диалогом, а не логинимся молча под 'user'
    setUnknownCode(true);
  }, []);

  return unknownCode ? (
    <div className="game-dialog">
      <CodeEnterDialog code={code} focusTurnId={focusTurnId} tourId={tourId} />
    </div>
  ) : (
    <Loading />
  );
};

const GameDialogPage = ({ hash }) => {
  const myGames = useSelector((state) => state.settings.games);
  const { info, token, reloadUserInfo } = useUserContext();

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
