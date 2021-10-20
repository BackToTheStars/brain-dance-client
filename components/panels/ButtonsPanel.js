import { useInteractionContext } from '../contexts/InteractionContext';
import { WIDGET_PICTURE, INTERACTION_ADD_QUOTE } from '../turn/settings';

const ButtonsPanel = () => {
  const { buttons } = useInteractionContext();
  console.log(buttons);

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

  const { activeWidget, interactWithWidget } = useInteractionContext();
  const widgetType = activeWidget ? activeWidget.widgetType : null;

  if (widgetType === WIDGET_PICTURE)
    return (
      <div className="actions panel">
        <button
          className="btn  btn-primary"
          onClick={(e) => {
            console.log({ widgetType, WIDGET_PICTURE, INTERACTION_ADD_QUOTE });
            interactWithWidget(INTERACTION_ADD_QUOTE);
          }}
        >
          Red Area
        </button>
      </div>
    );
};

export default ButtonsPanel;
