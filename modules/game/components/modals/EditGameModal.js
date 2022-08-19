import Modal from '@/modules/ui/components/Modal';
import { useState } from 'react';
import { editGame } from '../../games-redux/actions';
import { useDispatch } from 'react-redux';

const EditGameModal = ({ game, close }) => {
  const [name, setName] = useState(game.name);
  const [image, setImage] = useState(game.image);
  const [gameIsPublic, setGameIsPublic] = useState(game.public);
  const [description, setDescription] = useState(game.description);
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      name,
      public: gameIsPublic,
      hash: game.hash,
      description,
      image,
    };

    if (
      !gameIsPublic &&
      !confirm(
        'You will NEVER see this game again, if you will not save its access code right now!!!'
      )
    ) {
      return;
    }

    dispatch(editGame(game.hash, data, { onSuccess: close }));
  };

  return (
    <Modal close={close} title="Edit Game">
      <form onSubmit={(e) => handleSubmit(e)}>
        <div className="form-group">
          <div className="form-check form-check-inline">
            <input
              onChange={(e) => setGameIsPublic(true)}
              name="gameIsPublic"
              value="true"
              type="radio"
              className="form-check-input"
              checked={gameIsPublic}
            />
            <label className="form-check-label">Public</label>
          </div>
          <div className="form-check form-check-inline ml-3s">
            <input
              onChange={(e) => setGameIsPublic(false)}
              name="gameIsPublic"
              value="false"
              type="radio"
              className="form-check-input"
              checked={!gameIsPublic}
            />
            <label className="form-check-label ">Private</label>
          </div>
        </div>
        <div className="mt-3">
          <input
            className="form-control"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
          />
        </div>
        <div className="mt-3">
          <input
            className="form-control"
            name="image"
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="Screenshot"
          />
        </div>
        <div className="mt-3">
          <textarea
            className="form-control"
            rows="3"
            onChange={(e) => setDescription(e.target.value)}
            defaultValue={description}
            placeholder="Description"
          ></textarea>
        </div>
        <div className="mt-3">
          <button
            style={{ minWidth: '75px' }}
            type="submit"
            className="btn btn-primary"
          >
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditGameModal;
