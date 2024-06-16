'use client';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '../ui/Modal';
import { closeModal } from '../../redux/actions';
import { settings } from '../../config/settings';
import { useTranslations } from 'next-intl';
// import { closeModal } from '../../redux/actions';

// временные заглушки
const DefaultComponent = () => {
  return <div>отсутствуют настройки модального окна</div>;
};

const CommonModal = ({ ModalComponent = Modal }) => {
  const t = useTranslations('Common.Modal');
  const { open, type, params } = useSelector((store) => store.ui.modal);

  const dispatch = useDispatch();
  const Component = settings[type]?.component || DefaultComponent;
  const title = type ? t(settings[type]?.title) : '';

  const handleCancel = () => {
    dispatch(closeModal());
  };
  return (
    <ModalComponent title={title} isOpen={open} onCancel={handleCancel}>
      {open && <Component params={params} />}
    </ModalComponent>
  );
};
export default CommonModal;
