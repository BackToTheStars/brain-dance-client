import { useState, useEffect } from 'react';
import GameTable from '../components/GameTable';
import GameDetails from '../components/GameDetails';
import CreateGameForm from '../components/forms/CreateGameForm';
import EditGameForm from '../components/forms/EditGameForm';
import CodeEnterForm from '../components/forms/CodeEnterForm';
import useGameControl from '../components/hooks/game-control';
import useGamePlayerCode from '../components/hooks/edit-game-code';
import useEditCodeWarningPopup from '../components/hooks/edit-code-warning-popup';
import useEditGame from '../components/hooks/edit-game';
import NewGameWarningPopup from '../components/popups/NewGameWarningPopup';

import { API_URL } from '../components/config';
import { getToken } from '../components/lib/token';

const IndexPage = () => {
  const {
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
  } = useGameControl();

  const { code, addCode } = useGamePlayerCode();
  const { code: popupCode, createGame, enterGame } = useEditCodeWarningPopup();

  const [mode, setMode] = useState('visitor');

  const { game, editGame } = useEditGame();

  useEffect(() => {
    if (getToken()) {
      setMode('admin');
    }
  }, []);

  useEffect(() => {
    if (game) {
      const newGames = [...games];
      const mutatedIndex = newGames.findIndex(
        (item) => item.hash === game.hash
      );
      newGames[mutatedIndex] = game;
      setGames(newGames);
      setGameClicked(game);
      setToggleEditForm(false);
    }
  }, [game]);

  const deleteGame = (game) => {
    fetch(`${API_URL}/game?hash=${game.hash}`, {
      method: 'DELETE',
      headers: {
        'content-type': 'application/json',
      },
    })
      .then((res) => res.json()) // вернёт Promise
      .then((data) => {
        const { item, message } = data;
        if (item) {
          console.log({ item });
        } else {
          console.log({ message });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="container-fluid col-10 mt-4">
      {!!popupCode && (
        <NewGameWarningPopup code={popupCode} enterGame={enterGame} />
      )}
      {mode === 'admin' && <h4>User mode: {mode}</h4>}
      <div className="row">
        <div className="col-12">
          <CodeEnterForm />
        </div>
      </div>
      <div className="row">
        <div className="col-8">
          <GameTable games={games} onItemClick={onItemClick} />
          <div className="row">
            <div className="col-6">
              {!toggleCreateForm && !toggleEditForm && (
                <button
                  className="btn btn-success"
                  onClick={() => {
                    setToggleCreateForm(true);
                  }}
                >
                  Create New Game
                </button>
              )}
              <hr />
              {toggleCreateForm && (
                <CreateGameForm
                  setToggleCreateForm={setToggleCreateForm}
                  createGame={createGame}
                />
              )}
              {toggleEditForm && (
                <EditGameForm
                  setToggleEditForm={setToggleEditForm}
                  game={gameClicked}
                  editGame={editGame}
                />
              )}
            </div>
          </div>
        </div>
        <div className="col-4">
          <GameDetails
            game={gameClicked}
            {...{ mode, deleteGame, openEditGameForm, addCode, code }}
          />
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
