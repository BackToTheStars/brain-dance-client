import { useDispatch, useSelector } from 'react-redux';
import { Input, Switch } from 'antd';
import { updateWidget } from '@/modules/turns/redux/actions';
import { WIDGET_HEADER, widgetSettings } from '@/modules/turns/settings';
import SubWidgetBlocks from '../../forms/SubWidgetBlocks';

export const HeaderEditForm = ({ turnId, widgetId }) => {
  const dispatch = useDispatch();
  const widget = useSelector(
    (state) => state.turns.d[turnId].dWidgets[widgetId]
  );
  const updateField = (field, value) => {
    dispatch(
      updateWidget(turnId, widgetId, {
        ...widget,
        [field]: value,
      })
    );
  };
  return (
    <div className="panel-flex mb-2">
      <div className="w-2/3">
        <Input
          placeholder="Header:"
          value={widget.text}
          onChange={(e) => updateField('text', e.target.value)}
        />
      </div>
      <div className="w-1/6">
        <Switch
          defaultChecked={widget.show}
          checked={widget.show}
          onChange={(checked) => {
            updateField('show', checked);
          }}
        />
      </div>
    </div>
  );
};

export const HeaderAddForm = ({ widgetBlock: widget, updateWidgetBlock }) => {
  const settings = widgetSettings[WIDGET_HEADER];

  const updateField = (field, value) => {
    updateWidgetBlock({
      ...widget,
      [field]: value,
    });
  };

  return (
    <div className="panel-flex flex-col">
      <div className="flex">
        <div className="w-3/4">
          <Input
            placeholder="Header:"
            value={widget.text}
            onChange={(e) => updateField('text', e.target.value)}
          />
        </div>
        <div className="w-1/4">
          <Switch
            defaultChecked={widget.show}
            checked={widget.show}
            onChange={(checked) => {
              updateField('show', checked);
            }}
          />
        </div>
      </div>
      <SubWidgetBlocks
        settings={settings}
        widget={widget}
        updateField={updateField}
      />
    </div>
  );
};
