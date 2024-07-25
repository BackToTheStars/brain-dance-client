import { useDispatch } from 'react-redux';
import { openModal, resetThemeSettings } from '../../redux/actions';
import { IntButton as Button } from '@/ui/button';
import { CloseOutlined } from '@ant-design/icons';
import { MODAL_CONFIRM } from '@/config/lobby/modal';

const ResetSwitcher = () => {
  const dispatch = useDispatch();
  return (
    <Button
      size="xs"
      onClick={(e) => {
        e.preventDefault();
        dispatch(
          openModal(MODAL_CONFIRM, {
            text: 'All_display_settings_will_be_reset',
            callback: () => dispatch(resetThemeSettings()),
          }),
        );
      }}
    >
      <CloseOutlined />
    </Button>
  );
};
export default ResetSwitcher;
