// const { MODE_WIDGET_PARAGRAPH } = require('@/config/panel');
const { setPanelMode } = require('@/modules/panels/redux/actions');
const { useDispatch } = require('react-redux');

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
