import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { API_URL } from '../src/config';

const CodePage = () => {
  const router = useRouter();
  const { hash } = router.query;
  const [error, setError] = useState('');

  useEffect(() => {
    if (hash) {
      fetch(`${API_URL}/codes/login/${hash}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            // @todo:
            // save info
            // redirect
          } else {
            setError(data.message);
          }
        });
    }
  }, [hash]);

  return error ? error : 'In progress...';
};

export default CodePage;
