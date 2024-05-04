const { MODE_WIDGET_PARAGRAPH } = require('@/config/panel');
const { setPanelMode } = require('@/modules/panels/redux/actions');
const { useDispatch } = require('react-redux');

const ParagraphEditButton = () => {
  const dispatch = useDispatch();
  return (
    <a
      className="widget-button"
      href="#"
      onClick={(e) => {
        e.preventDefault();
        dispatch(
          setPanelMode({
            mode: MODE_WIDGET_PARAGRAPH,
            params: { editTurnId: turnId, editWidgetId: widgetId },
          }),
        );
      }}
    >
      <i className="fas fa-highlighter"></i>
    </a>
  );
};

export default ParagraphEditButton;
