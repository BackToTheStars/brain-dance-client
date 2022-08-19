import { useDispatch } from 'react-redux';
import { togglePanel } from '../redux/actions';
import { PANEL_SETTINGS } from '../settings';

const SettingsButton = () => {
  const dispatch = useDispatch();

  return (
    <div
      className="panel-settings-btn"
      onClick={() => {
        dispatch(togglePanel({ type: PANEL_SETTINGS }));
      }}
    >
      <i className="fa fa-cog" />
    </div>
  );
};

export default SettingsButton;
