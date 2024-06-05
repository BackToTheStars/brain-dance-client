import { useDispatch } from 'react-redux';
// import { resetThemeSettings } from '../../redux/actions';
import { IntButton as Button } from '@/ui/button';
import { CloseOutlined } from '@ant-design/icons';
import { openModal } from '../../../ui/redux/actions';
import { MODAL_CONFIRM } from '@/config/lobby/modal';
import { clearStore } from '@/modules/settings/redux/requests';

const ResetDataSwitcher = () => {
  const dispatch = useDispatch();
  return (
    <Button
      size="xs"
      onClick={(e) => {
        e.preventDefault();

        dispatch(
          openModal(MODAL_CONFIRM, {
            text: 'Будут сброшены все доступы к играм',
            callback: () => {
              clearStore();
              // @todo: удалить ключи всех игр по отдельности
              window.location.reload();
              // dispatch(resetThemeSettings())
            },
          }),
        );
      }}
    >
      <CloseOutlined />
    </Button>
  );
};
export default ResetDataSwitcher;
