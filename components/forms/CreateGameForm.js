import { useState } from 'react';

const CreateGameForm = ({ setToggleCreateForm, createGame }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const gameIsPublic = e.target.gameIsPublic.value === 'true';
    createGame({ name, gameIsPublic });
  };

  return (
    <div className="card">
      <div className="card-body">
        <form className="row" onSubmit={(e) => handleSubmit(e)}>
          <div className="col-3">
            <div className="form-check form-check-inline">
              <input
                name="gameIsPublic"
                value={true}
                defaultChecked
                type="radio"
                className="form-check-input"
              />
              <label className="form-check-label">Public</label>
            </div>
            <div className="form-check form-check-inline ml-3">
              <input
                name="gameIsPublic"
                value="false"
                type="radio"
                className="form-check-input"
                disabled={true}
              />
              <label className="form-check-label">Private</label>
            </div>
          </div>
          <div className="col-6">
            <div className=" row">
              <label className="col-2">Name:</label>
              <input className="form-control col-10" name="name" type="text" />
            </div>
          </div>
          <div className="col-3">
            <button type="submit" className="btn btn-primary">
              Create
            </button>
            <button
              className="btn btn-link"
              onClick={() => {
                setToggleCreateForm(false);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGameForm;
