import { useState } from 'react';
import useEditCodeWarningPopup from '../hooks/edit-code-warning-popup';

const CodeEnterForm = () => {
  const { enterGame } = useEditCodeWarningPopup();

  const [accessCode, setAccessCode] = useState('');
  const [userNickname, setUserNickname] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!accessCode) setErrorMessage('Enter access code');
    else if (!userNickname) setErrorMessage('Enter your nickname');
    else enterGame(accessCode, userNickname);
  };

  const accessHandler = (event) => {
    if (event.key === 'Enter') {
      handleSubmit(event);
    } else if (!!errorMessage) {
      setErrorMessage('');
    }
  };

  return (
    <form className="form-inline" onSubmit={handleSubmit}>
      <div className="form-group mb-2 mr-3">
        <label htmlFor="code" className="sr-only">
          Enter Code
        </label>
        <input
          name="code"
          type="text"
          className="form-control mr-3"
          placeholder="Enter code..."
          onChange={(e) => setAccessCode(e.target.value)}
          value={accessCode}
          onKeyDown={accessHandler}
        />
        <input
          name="nickname"
          type="text"
          className="form-control"
          placeholder="Enter nickname..."
          onChange={(e) => setUserNickname(e.target.value)}
          value={userNickname}
          onKeyDown={accessHandler}
        />
      </div>
      <button type="submit" className="btn btn-primary mb-2">
        Enter Game
      </button>
      {!!errorMessage && <div className="ml-3 text-danger">{errorMessage}</div>}
    </form>
  );
};

export default CodeEnterForm;
