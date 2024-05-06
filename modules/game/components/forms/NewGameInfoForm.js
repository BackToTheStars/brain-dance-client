const NewGameInfoForm = ({ code, enterGame, gameIsPublic }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    enterGame(e.target.code.value, e.target.nickname.value);
  };

  return (
    <>
      <div className="alert alert-light" role="alert">
        <p>
          <b>Important!</b>
        </p>
        <p>
          Please, save the code <b>{code.hash}</b>
        </p>
        {!gameIsPublic && (
          <p className="alert alert-danger">
            If you will not save this code, you will never see this game field
            again!
          </p>
        )}
        <p>Type the nickname below.</p>
      </div>
      <form className="form-inline" onSubmit={handleSubmit}>
        <div className="mx-sm-3 mb-2">
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
    </>
  );
};

export default NewGameInfoForm;
