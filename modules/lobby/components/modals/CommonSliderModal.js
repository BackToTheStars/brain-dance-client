import SliderModal from '../widgets/SliderModal';
import { useDispatch, useSelector } from 'react-redux';
import { settings } from './settings';
import { closeSliderModal } from '../../redux/actions';

const DefaultComponent = () => {
  return <div>отсутствуют настройки модального окна</div>;
};

const CommonSliderModal = () => {
  const { open, type, params } = useSelector((s) => s.lobby.sliderModal);
  const Component = settings[type]?.component || DefaultComponent;
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(closeSliderModal());
  };

  return (
    <SliderModal open={open} closeModal={handleClick}>
      {!!open && <Component params={params} />}
    </SliderModal>
  );
};

export default CommonSliderModal;
