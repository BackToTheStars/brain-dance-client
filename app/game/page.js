'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import '@/themes/game/index.scss';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Loading from '@/modules/ui/components/common/Loading';
import {
  UserProvider,
  useUserContext,
} from '@/modules/user/contexts/UserContext';

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
          <GameDialog hash={hash} />
        </UserProvider>
      )}
    </div>
  );
};

// @todo
const GameDialog = ({ hash }) => {
  const { info, token, can } = useUserContext();
  const router = useRouter();
  useEffect(() => {
    if (!hash) return;
    router.push(`/game/view/${hash}`);
    // nickname, role
    // ? code, hash

    // если роль не гостевая и nickname не установлен, то запросить его
    // если отсутствует code, то запросить его

    // если в явном виде не указано, что сохранение кода не требуется, то запросить сохранение
    // если игра предполагает запрет сохранения, то выставить запрет и продолжить
    // при необходимости запросить nickname пользователя
  }, [hash, info, token]);
  return <div className="game-dialog">Dialog</div>;
};

export default GamePage;
