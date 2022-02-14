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
          <div className="col-sm-9 mb-3">
            <input
              className="form-control"
              name="name"
              type="text"
              placeholder="Name"
            />
          </div>
          <div className="col-sm-3 mb-3 text-end">
            <button type="submit" className="btn btn-primary">
              Create
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CreateGameModal;
