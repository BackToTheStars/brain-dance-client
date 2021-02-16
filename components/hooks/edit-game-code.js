import { useState } from 'react';
import { API_URL } from '../../src/config';
import { getToken } from '../../src/lib/token';

const useGamePlayerCode = (gameToken) => {
  const [code, setCode] = useState('');
  const headers = {
    'content-type': 'application/json',
  };
  if (gameToken) {
    headers['game-token'] = gameToken;
  } else {
    headers['authorization'] = `Bearer ${getToken()}`;
  }

  const addCode = (game) => {
    fetch(`${API_URL}/codes?hash=${game.hash}`, {
      method: 'POST',
      headers,
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
