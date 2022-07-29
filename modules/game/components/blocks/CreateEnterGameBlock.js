import CodeEnterForm from '@/modules/game/components/forms/CodeEnterForm';
import CreateGameModal from '@/modules/game/components/modals/CreateGameModal';
import NewGameInfoModal from '@/modules/game/components/modals/NewGameInfoModal';
import { useState } from 'react';

const CreateEnterGameBlock = ({ enterGame, onGameCreate }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGameInfo, setNewGameInfo] = useState(null);

  return (
    <>
      <div className="row">
        <div className="col-xl-9 pt-2">
          <CodeEnterForm />
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
