// const { MODE_WIDGET_PARAGRAPH } = require('@/config/panel');
const { setPanelMode } = require('@/modules/panels/redux/actions');
const { useDispatch } = require('react-redux');
const { TID } = require('@/config/testIds');

const WidgetEditButton = ({
  turnId,
  widgetId,
  mode,
  additionalCallback = () => {},
}) => {
  const dispatch = useDispatch();
  return (
    <a
      className="widget-button"
      href="#"
      data-test-id={TID.widgetEdit}
      data-turn-id={turnId}
      data-widget-id={widgetId}
      onClick={(e) => {
        e.preventDefault();
        dispatch(
          setPanelMode({
            mode,
            params: { editTurnId: turnId, editWidgetId: widgetId },
          }),
        );
        additionalCallback();
      }}
    >
      <i className="fas fa-highlighter"></i>
    </a>
  );
};

export default WidgetEditButton;
