import { closeModal } from '@/modules/ui/redux/actions';
import { useDispatch } from 'react-redux';
import { IntButton as Button } from '@/ui/button';

const ConfirmModal = ({ params }) => {
  const { text = '', callback = () => {} } = params;
  const dispatch = useDispatch();
  const onCancel = () => dispatch(closeModal());
  const onOk = () => {
    callback();
    dispatch(closeModal());
  };
  return (
    <div
      className="h-full flex flex-col"
      style={{
        height: '150px',
      }}
    >
      <div className="flex-1">{text}</div>
      <div className="mt-3 text-end">
        <Button onClick={onCancel} className="mr-3">
          Отмена
        </Button>
        <Button onClick={onOk}>ОК</Button>
      </div>
    </div>
  );
};

export default ConfirmModal;
