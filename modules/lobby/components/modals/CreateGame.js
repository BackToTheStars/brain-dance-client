import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { closeModal } from '@/modules/ui/redux/actions';
import { LobbyForm } from '../ui/Form';
import { createGameRequest } from '@/modules/game/requests';
import { lobbyEnterGameWithConfirm } from '../../redux/actions';
import { useTranslations } from 'next-intl';

const CreateGameModal = ({ params }) => {
  const t = useTranslations('Lobby');
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
          label: t('Public'),
        },
        {
          value: 'false',
          label: t('Private'),
        },
      ],
    },
    {
      label: t('game_name'),
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
    const { name, gameIsPublic, nickname = 'Owner' } = values;
    // @todo: перенести в action
    createGameRequest(name, gameIsPublic === 'true').then((data) => {
      if (data?.item) {
        const { code } = data.item;
        dispatch(lobbyEnterGameWithConfirm(code.hash, nickname)).catch(
          (msg) => {
            setError(msg);
          },
        );
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
      confirmText={t('Create_game')}
    />
  );
};

export default CreateGameModal;
