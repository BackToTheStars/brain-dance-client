import { useState } from 'react';
import { useSelector } from 'react-redux';

const EditGameForm = () => {
  //
  const editGame = () => {};

  const game = useSelector((state) => state.game.game);

  const [name, setName] = useState(game.name);
  const [image, setImage] = useState(game.image);
  const [gameIsPublic, setGameIsPublic] = useState(game.public);
  const [description, setDescription] = useState(game.description);

  const showConfirmDialog = ({ text, okCallback }) => {
    if (confirm(text)) {
      okCallback();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      name,
      gameIsPublic,
      hash: game.hash,
      description,
      image,
    };
    if (!gameIsPublic) {
      showConfirmDialog({
        text: 'You will NEVER see this game again, if you will not save its access code right now!!!',
        okCallback: () => {
          editGame(data);
        },
      });
    } else {
      editGame(data);
    }
  };

  return (
    <form className="card mt-3" onSubmit={(e) => handleSubmit(e)}>
      <div className="card-body ">
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
        <div className="form-group">
          <label>Name</label>
          <input
            className="form-control"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Screenshot</label>
          <input
            className="form-control"
            name="image"
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            className="form-control"
            rows="3"
            onChange={(e) => setDescription(e.target.value)}
            defaultValue={description}
          ></textarea>
        </div>
        <button
          style={{ minWidth: '75px' }}
          type="submit"
          className="btn btn-primary mr-3"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default EditGameForm;
