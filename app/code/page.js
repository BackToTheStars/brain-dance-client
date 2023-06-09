'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { setGameInfoIntoStorage } from '@/modules/user/contexts/UserContext';
import { getGameUserTokenRequest } from '@/modules/user/requests';

const CodePage = () => {
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
