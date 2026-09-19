// const { MODE_WIDGET_PARAGRAPH } = require('@/config/panel');
const { setPanelMode } = require('@/modules/panels/redux/actions');
const { useDispatch, useSelector } = require('react-redux');
const { TID } = require('@/config/testIds');
const { selectFollowing } = require('@/modules/presence/redux/selectors');

const WidgetEditButton = ({
  turnId,
  widgetId,
  mode,
  additionalCallback = () => {},
}) => {
  const dispatch = useDispatch();
  // Спутник экскурсии только смотрит: разметку он не начинает — так же, как не
  // получает «править / вырезать / удалить» на панели карточки.
  const following = useSelector(selectFollowing);
  if (following) return null;
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
