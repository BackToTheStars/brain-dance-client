'use client';

import dynamic from 'next/dynamic'; // позволяет динамически подключать библиотеки в bundle
import { Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { UserProvider } from '@/modules/user/contexts/UserContext';
import Loading from '@/modules/ui/components/common/Loading';
const CanvasAccess = dynamic(
  () => import('@/modules/game/components/CanvasAccess'),
  { ssr: false, loading: () => <Loading /> },
);

const GamePage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <GamePageInner />
    </Suspense>
  );
};

const GamePageInner = () => {
  const { hash } = useParams();
  // ссылка на ход (задача «поделиться адресом хода»): ?turn=<turnId>
  // ссылка-приглашение в экскурсию: ?tour=<tourId>
  const searchParams = useSearchParams();
  const focusTurnId = searchParams.get('turn');
  const tourId = searchParams.get('tour');
  return (
    <>
      <div className="circle" />

      <div className="game-bg">
        <UserProvider key={hash} hash={hash}>
          <CanvasAccess hash={hash} focusTurnId={focusTurnId} tourId={tourId} />
        </UserProvider>
      </div>
    </>
  );
};

export default GamePage;
