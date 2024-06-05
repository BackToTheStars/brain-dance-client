'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { setGameInfoIntoStorage } from '@/modules/user/contexts/UserContext';
import { getGameUserTokenRequest } from '@/modules/game/requests';

const CodePage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CodePageInner />
    </Suspense>
  );
}

const CodePageInner = () => {
  const searchParams = useSearchParams();
  const hash = searchParams.get('hash');
  const nickname = searchParams.get('nickname');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!hash) return;

    getGameUserTokenRequest(hash, nickname).then((data) => {
      if (data.success) {
        const { info, token } = data;
        setGameInfoIntoStorage(info.hash, {
          info,
          token,
        });
        // для корректной работы кнопки "назад"
        location.replace(`/game?hash=${info.hash}`);
      } else {
        setError(data.message);
      }
    });
  }, [hash]);

  return error ? error : 'In progress...';
};

export default CodePage;
