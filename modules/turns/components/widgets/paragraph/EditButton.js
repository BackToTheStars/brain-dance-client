import WidgetEditButton from '../buttons/Edit';

const { MODE_WIDGET_PARAGRAPH } = require('@/config/panel');
const { setPanelMode } = require('@/modules/panels/redux/actions');
const { useDispatch } = require('react-redux');

const ParagraphEditButton = ({ turnId, widgetId }) => {
  return (
    <WidgetEditButton
      turnId={turnId}
      widgetId={widgetId}
      mode={MODE_WIDGET_PARAGRAPH}
    />
  );
};

export default ParagraphEditButton;
