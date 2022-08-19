import { useInteractionContext } from '../contexts/InteractionContext';

const ButtonsPanel = () => {
  const { buttons } = useInteractionContext();
  // console.log(buttons);

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
};

export default ButtonsPanel;
