import { useSelector } from 'react-redux';
import { PANEL_BUTTONS } from '../settings';

const ButtonsPanel = () => {
  const buttons = useSelector((state) => state.panels.d[PANEL_BUTTONS].buttons);

  return (
    <div className="actions panel">
      {/* {  text: 'Save Field',
             callback: () => saveField(),
             show: () => can(RULE_TURNS_CRUD),
      }, */}
      {buttons.map((button, index) =>
        !!button && (!button.show || button.show()) ? (
          <button
            key={index}
            className="btn  btn-primary"
            onClick={button.callback}
          >
            {button.text}
          </button>
        ) : (
          <div key={index} className="empty-button-space"></div>
        )
      )}
    </div>
  );
  return <>ButtonsPanel</>;
};

export default ButtonsPanel;
