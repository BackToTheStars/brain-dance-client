import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { closeModal } from '@/modules/ui/redux/actions';
import { LobbyForm } from '../ui/Form';

const CreateGameModal = ({ params }) => {
  const dispatch = useDispatch();
  const [error, setError] = useState('');
  const inputs = [
    {
      label: '',
      name: 'gameIsPublic',
      type: 'radio',
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

  const onFinish = (values) => {};

  return (
    <LobbyForm
      onFinish={onFinish}
      onCancel={() => dispatch(closeModal())}
      inputs={inputs}
      error={error}
    />
  );
};

export default CreateGameModal;
