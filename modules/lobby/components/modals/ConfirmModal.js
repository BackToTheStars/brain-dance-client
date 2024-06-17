import { closeModal } from '@/modules/ui/redux/actions';
import { useDispatch } from 'react-redux';
import { IntButton as Button } from '@/ui/button';
import { useTranslations } from 'next-intl';

const ConfirmModal = ({ params }) => {
  const t = useTranslations('Lobby.confirmModal');
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
      <div className="flex-1">{t(text)}</div>
      <div className="mt-3 flex justify-end gap-2">
        <Button onClick={onCancel}>{t('Cancel')}</Button>
        <Button onClick={onOk}>{t('OK')}</Button>
      </div>
    </div>
  );
};

export default ConfirmModal;
