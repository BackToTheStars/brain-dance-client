import Modal from '@/modules/ui/components/Modal';

const NewGameInfoModal = ({ close, newGameInfo, enterGame }) => {
  const {
    code: { hash },
    public: gameIsPublic,
  } = newGameInfo;

  const handleSubmit = (e) => {
    e.preventDefault();
    enterGame(hash, e.target.nickName);
  }

  return (
    <Modal close={close} title="New Game Info">
      <div>
        <p className='modal-text'>
          <b>Important!</b>
        </p>
        <p className='modal-text'>
          Please, save the code <b>{hash}</b>
        </p>
        {!gameIsPublic && (
          <p className="alert alert-danger">
            If you will not save this code, you will never see this game field
            again!
          </p>
        )}
        <p className='modal-text'>Type the nickname below.</p>
      </div>
      <form className="form-inline" onSubmit={handleSubmit}>
        <div className="mb-2">
          <input
            type="text"
            name="nickname"
            className="form-control mb-3 modal-field"
            placeholder="Nickname"
          />
          <input className="btn btn-primary" type="submit" value="Enter the game" />
        </div>
      </form>
    </Modal>
  );
};

export default NewGameInfoModal;
