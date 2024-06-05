import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { closeModal } from '@/modules/ui/redux/actions';
import { LobbyForm } from '../ui/Form';
import { createGameRequest } from '@/modules/game/requests';
import { lobbyEnterGameWithConfirm } from '../../redux/actions';

const CreateGameModal = ({ params }) => {
  const dispatch = useDispatch();
  const [error, setError] = useState('');
  const inputs = [
    {
      label: '',
      name: 'gameIsPublic',
      type: 'radio',
      defaultValue: 'true',
      options: [
        {
          value: 'true',
          label: 'public',
        },
        {
          value: 'false',
          label: 'private',
        },
      ],
    },
    {
      label: 'название игры',
      name: 'name',
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
    const { name, gameIsPublic } = values;
    // @todo: перенести в action
    createGameRequest(name, gameIsPublic === 'true').then((data) => {
      if (data?.item) {
        const { code } = data.item;
        dispatch(lobbyEnterGameWithConfirm(code.hash, 'Owner')).catch((msg) => {
          setError(msg);
        });
      } else {
        setError(data?.message || 'Что-то пошло не так');
      }
    });
  };

  return (
    <LobbyForm
      onFinish={onFinish}
      onCancel={() => dispatch(closeModal())}
      inputs={inputs}
      error={error}
      confirmText="Создать игру"
    />
  );
};

export default CreateGameModal;
