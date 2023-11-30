import { useDispatch, useSelector } from 'react-redux';
import { closeModal } from '../../redux/actions';
import { settings } from './settings';
import Modal from '../widgets/Modal';

const DefaultComponent = () => {
  return <div>отсутствуют настройки модального окна</div>;
};

const CommonModal = () => {
  const { open, type, params } = useSelector((store) => store.lobby.modal);
  const dispatch = useDispatch();
  const Component = settings[type]?.component || DefaultComponent;
  const title = settings[type]?.title || '';

  const handleCancel = () => {
    dispatch(closeModal());
  };
  return (
    <Modal title={title} isOpen={open} onCancel={handleCancel}>
      {open && <Component params={params} />}
    </Modal>
  );
};
export default CommonModal;
