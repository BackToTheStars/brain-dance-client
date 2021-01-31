import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { API_URL } from '../src/config';

import { setGameInfo } from '../src/lib/gameToken';

const CodePage = () => {
  const router = useRouter();
  const { hash, nickname } = router.query;
  const [error, setError] = useState('');

  useEffect(() => {
    if (hash) {
      fetch(`${API_URL}/codes/login/${hash}?nickname=${nickname}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            // save info (hash, name, role)
            const { info, token } = data;
            setGameInfo(info.hash, {
              info,
              token,
            });
            // redirect
            location.replace(`/game?hash=${info.hash}`);
          } else {
            setError(data.message);
          }
        });
    }
  }, [hash]);

  return error ? error : 'In progress...';
};

export default CodePage;
