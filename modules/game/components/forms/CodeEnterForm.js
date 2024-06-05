import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

const CodeEnterForm = ({ hash }) => {
  const [accessCode, setAccessCode] = useState('');
  const [userNickname, setUserNickname] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const router = useRouter();
  const enterGame = (hash, nickname) => {
    router.push(`/code?hash=${hash}&nickname=${nickname}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    //setShowCreateModal(true)

    /*if (!accessCode) {
      setErrorMessage('Enter access code');
    } else if (!userNickname) {
      setErrorMessage('Enter your nickname');
    } else {
      //enterGame(accessCode, userNickname);
      setShowCreateModal(true)
    }*/
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
        <button type="submit" className="enter-game"   
        >
          Enter Game
        </button>
      </div>
      {!!errorMessage && <div className="text-danger mb-2">{errorMessage}</div>}
    </form>
  );
};

export default CodeEnterForm;
