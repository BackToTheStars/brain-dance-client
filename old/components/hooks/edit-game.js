import { useState } from 'react';
import { API_URL } from '../config';
import { getToken } from '../lib/token';

const useEditGame = (gameToken) => {
  const [game, setGame] = useState();
  const headers = {
    'content-type': 'application/json',
  };
  if (gameToken) {
    headers['game-token'] = gameToken; // owner или player
  } else {
    headers['authorization'] = `Bearer ${getToken()}`; // superadmin
  }

  const editGame = ({ name, gameIsPublic, description, hash, image }) => {
    // description, players - добавить;
    fetch(`${API_URL}/game?hash=${hash}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        name,
        public: gameIsPublic,
        description,
        image,
      }),
    })
      .then((res) => res.json()) // вернёт Promise
      .then((data) => {
        const { item } = data;
        if (!item) {
          // @todo: check statusCode
          alert('Error!');
          return;
        }

        setGame(item);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return {
    game,
    editGame,
  };
};

export default useEditGame;
