import Modal from '@/modules/ui/components/Modal';
import { useDispatch, useSelector } from 'react-redux';
import { closeError } from '../../games-redux/actions';

const ErrorGameModal = () => {
  const error = useSelector((state) => state.games?.error);
  const dispatch = useDispatch();
  return error ? (
    <Modal title="Error" close={() => dispatch(closeError())}>
      <div className="alert alert-warning">{error}</div>
    </Modal>
  ) : (
    ''
  );
};

export default ErrorGameModal;
