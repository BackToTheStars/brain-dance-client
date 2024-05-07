import { useState } from 'react';
import { getGameUserTokenRequest } from '@/modules/user/requests';
// import { setGameInfoIntoStorage } from '@/modules/user/contexts/UserContext';
import { useDispatch } from 'react-redux';
import { addGame } from '@/modules/settings/redux/actions';
import { closeModal } from '@/modules/ui/redux/actions';
import { LobbyForm } from '../ui/Form';

const EnterGameModal = ({ params }) => {
  const dispatch = useDispatch();
  const [error, setError] = useState('');
  const inputs = [
    {
      label: 'код',
      name: 'code',
    },
    {
      label: 'никнейм',
      name: 'nickname',
    },
  ];

  const onFinish = (values) => {
    for (const input of inputs) {
      if (!values[input.name]) {
        setError('Заполните все поля');
        return;
      }
    }
    setError('');
    // @todo: перенести в action
    getGameUserTokenRequest(values.code, values.nickname).then((data) => {
      if (data.success) {
        const { info, token } = data;
        const { hash, nickname, role } = info;
        dispatch(addGame({ hash, nickname, role, code: values.code }));
        // setGameInfoIntoStorage(info.hash, {
        //   info,
        //   token,
        // });
        // @todo: получить данные о полном адресе игры
        // location.replace(`/game?hash=${info.hash}`);
      } else {
        setError(data.message);
      }
    });
  };

  return (
    <LobbyForm
      onFinish={onFinish}
      onCancel={() => dispatch(closeModal())}
      inputs={inputs}
      error={error}
    />
  );
};

export default EnterGameModal;
