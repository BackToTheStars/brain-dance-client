import CodeEnterForm from '@/modules/game/components/forms/CodeEnterForm';
import CreateGameModal from '@/modules/game/components/modals/CreateGameModal';
import NewGameInfoModal from '@/modules/game/components/modals/NewGameInfoModal';
import EnterGameModal from '@/modules/game/components/modals/EnterGameModal';

import { useState } from 'react';

const CreateEnterGameBlock = ({ enterGame, onGameCreate }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGameInfo, setNewGameInfo] = useState(null);
  const [showEnterGameModal, setEnterGameModal] = useState(false);

  return (
    <>
      <div className="row">
        <div className="col-xl-9 pt-2">
          {/* <CodeEnterForm /> */}
          <button
            className="enter-game"
            onClick={() => setEnterGameModal(true)}
          >
            Enter Game
          </button>

        </div>
        <div className="col-xl-3 pt-2 text-md-end">
          <button
            className="btn-create"
            onClick={() => setShowCreateModal(true)}
          >
            Create New Game
          </button>
        </div>
      </div>
      {/* POPUPS */}
      {showCreateModal && (
        <CreateGameModal
          close={() => setShowCreateModal(false)}
          onCreate={(data) => {
            // ещё раз запрашиваем игры
            onGameCreate();
            // закрываем модальное окно
            setShowCreateModal(false);
            // устанавливаем игру для записи пользователем кода
            setNewGameInfo(data.item);
          }}
        />
      )}

      {showEnterGameModal && (
        <EnterGameModal
          close={() => setEnterGameModal(false)}
          onCreate={(data) => {
            // ещё раз запрашиваем игры
            //onEnterCreate();
            // закрываем модальное окно
            setEnterGameModal(false);
            // устанавливаем игру для записи пользователем кода
            //setEnterCreateInfo(data.item);
          }}
        />
      )}


      {!!newGameInfo && (
        <NewGameInfoModal
          close={() => setNewGameInfo(null)}
          newGameInfo={newGameInfo}
          // code={'popupCode'}
          enterGame={enterGame}
          // gameIsPublic={'gameIsPublic'}
        />
      )}
    </>
  );
};

export default CreateEnterGameBlock;
