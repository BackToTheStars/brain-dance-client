// import { useState } from 'react';

const NewGameWarningPopup = ({ code, enterGame }) => {
  console.log({ code });
  const handleSubmit = (e) => {
    e.preventDefault();
    enterGame(e.target.code.value, e.target.nickname.value);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="alert alert-light" role="alert">
          <p>
            <b>Important!</b>
          </p>
          <p>
            Please, save the code <b>{code.hash}</b>
          </p>
          <p>Type the nickname below.</p>
        </div>
        <form className="form-inline" onSubmit={handleSubmit}>
          <div className="form-group mx-sm-3 mb-2">
            <input type="hidden" name="code" value={code.hash} />
            <input
              type="text"
              name="nickname"
              className="form-control"
              placeholder="Nickname"
            />
            <input type="submit" value="Enter the game" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewGameWarningPopup;
