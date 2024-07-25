import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Button, Input } from 'antd';
import { getGameUserTokenRequest } from '../../requests';
import { setGameInfoIntoStorage, useUserContext } from '@/modules/user/contexts/UserContext';

const CodeEnterForm = ({ hash }) => {
  const { reloadUserInfo } = useUserContext();
  const [accessCode, setAccessCode] = useState('');
  const [userNickname, setUserNickname] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    getGameUserTokenRequest(accessCode, userNickname).then((data) => {
      if (data.success) {
        const { info, token } = data;
        setGameInfoIntoStorage(hash, {
          info,
          token,
        });
        setTimeout(() => {
          reloadUserInfo();
        }, 300)
      } else {
        setErrorMessage(data?.message || 'Неизвестная ошибка');
      }
    });
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
        <Input
          size="small"
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
        <Input
          size="small"
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
        <Button size="small" htmlType="submit" className="enter-game">
          Enter Game
        </Button>
      </div>
      {!!errorMessage && <div className="text-danger mb-2">{errorMessage}</div>}
    </form>
  );
};

export default CodeEnterForm;
