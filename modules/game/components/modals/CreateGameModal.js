import { createGameRequest } from '@/modules/admin/requests';
import Modal from '@/modules/ui/components/Modal';

const CreateGameModal = ({ close, onCreate }) => {

  const submitData = ({ name, gameIsPublic }) => {
    createGameRequest(name, gameIsPublic).then((data) => {
      onCreate(data);
    });
  };
  return (
    <Modal title="Create Game" close={close}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitData({
            name: e.target.name.value,
            gameIsPublic: e.target.gameIsPublic.value === 'true',
          });
        }}
      >
        <div className="form-check form-check-inline mb-3">
          <input
            name="gameIsPublic"
            value={true}
            defaultChecked
            type="radio"
            className="form-check-input"
          />
          <label className="form-check-label">Public</label>
        </div>
        <div className="form-check form-check-inline mb-3">
          <input
            name="gameIsPublic"
            value="false"
            type="radio"
            className="form-check-input"
          />
          <label className="form-check-label">Private</label>
        </div>
        <div className="row">
          <div>
            <input
              className="form-control modal-field"
              name="name"
              type="text"
              placeholder="Name"
              required
            />
          </div>         

          <div className="modal-footer">
            <button type="button" className="btn cancel" onClick={close}>Cancel</button>
            <button type="submit" className="btn enter-btn">Create Game</button>
          </div>
        
        </div>
      </form>
    </Modal>
  );
};

export default CreateGameModal;
