import { useState } from 'react';
import { API_URL } from '../config';
import { getToken } from '../lib/token';

const useGamePlayerCode = (gameToken) => {
  const [code, setCode] = useState('');
  const [codes, setCodes] = useState([]);

  const headers = {
    'content-type': 'application/json',
  };
  if (gameToken) {
    headers['game-token'] = gameToken; // owner или player
  } else {
    headers['authorization'] = `Bearer ${getToken()}`; // superadmin
  }

  const addCode = (game) => {
    fetch(`${API_URL}/codes?hash=${game.hash}`, {
      method: 'POST',
      headers,
    })
      .then((res) => res.json()) // вернёт Promise
      .then((data) => {
        const { item, message, codes } = data;
        if (item) {
          setCode(item.hash);
          setCodes(codes);
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
    codes,
    addCode,
  };
};

export default useGamePlayerCode;
