import { useState } from 'react';

const CodeEnterForm = ({ enterGame }) => {
  const [accessCode, setAccessCode] = useState('');
  const [userNickname, setUserNickname] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!accessCode) {
      setErrorMessage('Enter access code');
    } else if (!userNickname) {
      setErrorMessage('Enter your nickname');
    } else {
      enterGame(accessCode, userNickname);
    }
  };

  return (
    <form className="row" onSubmit={handleSubmit}>
      <div className="col-auto mb-2">
        <input
          name="code"
          type="text"
          className="form-control"
          placeholder="Enter code..."
          onChange={(e) => setAccessCode(e.target.value)}
          value={accessCode}
          onKeyDown={() => setErrorMessage('')}
        />
      </div>
      <div className="col-auto mb-2">
        <input
          name="nickname"
          type="text"
          className="form-control"
          placeholder="Enter nickname..."
          onChange={(e) => setUserNickname(e.target.value)}
          value={userNickname}
          onKeyDown={() => setErrorMessage('')}
        />
      </div>
      <div className="col-auto mb-2">
        <button type="submit" className="btn btn-primary mb-2 mr-3 ">
          Enter Game
        </button>
      </div>
      {!!errorMessage && <div className="text-danger mb-2">{errorMessage}</div>}
    </form>
  );
};

export default CodeEnterForm;
