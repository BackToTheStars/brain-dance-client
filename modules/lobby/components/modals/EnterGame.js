import { useState } from 'react';
import { useDispatch } from 'react-redux';

import { closeModal } from '@/modules/ui/redux/actions';
import { LobbyForm } from '../ui/Form';
import { lobbyEnterGameWithConfirm } from '../../redux/actions';
import { useTranslations } from 'next-intl';

const EnterGameModal = ({ params }) => {
  const t = useTranslations('Lobby');
  const dispatch = useDispatch();
  const [error, setError] = useState('');
  const inputs = [
    {
      label: t('code'),
      name: 'code',
    },
    {
      label: t('nickname'),
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
    dispatch(lobbyEnterGameWithConfirm(values.code, values.nickname)).catch((msg) => {
      setError(msg);
    });
  };

  return (
    <LobbyForm
      onFinish={onFinish}
      onCancel={() => dispatch(closeModal())}
      inputs={inputs}
      error={error}
      confirmText={t('Enter_game')}
    />
  );
};

export default EnterGameModal;
