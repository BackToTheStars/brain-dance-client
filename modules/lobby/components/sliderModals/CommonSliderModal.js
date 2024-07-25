import SliderModal from '../widgets/SliderModal';
import { useDispatch, useSelector } from 'react-redux';

import { closeSliderModal } from '../../redux/actions';
import { settingsSliderModal } from './settings';

const DefaultComponent = () => {
  return <div>отсутствуют настройки модального окна</div>;
};

const CommonSliderModal = () => {
  const { open, type, params } = useSelector((s) => s.lobby.sliderModal);
  const Component = settingsSliderModal[type]?.component || DefaultComponent;
  const dispatch = useDispatch();

  const handleClose = () => {
    dispatch(closeSliderModal(500));
  };

  return (
    <SliderModal open={open} closeModal={handleClose}>
      {!!type && <Component params={params} closeModal={handleClose} />}
    </SliderModal>
  );
};

export default CommonSliderModal;
