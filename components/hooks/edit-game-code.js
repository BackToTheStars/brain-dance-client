import { useState } from 'react';
import { API_URL } from '../../src/config';
import { getToken } from '../../src/lib/token';

const useGamePlayerCode = () => {
  const [code, setCode] = useState('');

  const addCode = (game) => {
    fetch(`${API_URL}/codes?hash=${game.hash}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${getToken()}`,
      },
    })
      .then((res) => res.json()) // вернёт Promise
      .then((data) => {
        const { item, message } = data;
        if (item) {
          setCode(item.hash);
        } else {
          console.log({ message });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return {
    code,
    addCode,
  };
};

export default useGamePlayerCode;
