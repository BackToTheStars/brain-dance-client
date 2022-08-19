// Custom hook, отвечающий за взаимодействие с игрой и хранение её state'ов

import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { getToken } from '../lib/token';

const useGameControl = () => {
  const [games, setGames] = useState([]);

  const [gameClicked, setGameClicked] = useState(null);
  const [toggleCreateForm, setToggleCreateForm] = useState(false);
  const [toggleEditForm, setToggleEditForm] = useState(false);

  useEffect(() => {
    getGames();
  }, []); // component did mount

  useEffect(() => {
    if (!games.length) return;
    if (gameClicked) return;
    setGameClicked(games[0]);
  }, [games]); // когда state или props изменился

  const openEditGameForm = (game) => {
    setToggleEditForm(true);
    setToggleCreateForm(false);
  };

  const onItemClick = (hash) => {
    setGameClicked(games.find((game) => game.hash === hash));
    setToggleCreateForm(false);
    setToggleEditForm(false);
  };

  const getGames = () => {
    fetch(`${API_URL}/games`, {
      headers: {
        authorization: `Bearer ${getToken()}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const { items } = data;
        setGames(items);
      });
  };

  return {
    games,
    setGames,
    openEditGameForm,
    onItemClick,
    gameClicked,
    setGameClicked,
    toggleCreateForm,
    setToggleCreateForm,
    toggleEditForm,
    setToggleEditForm,
  };
};

export default useGameControl;
