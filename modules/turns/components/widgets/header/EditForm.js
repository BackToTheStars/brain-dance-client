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
    <div className="form-group panel-flex mb-2">
      <div className="col-sm-8">
        <Input
          placeholder="Header:"
          value={widget.text}
          onChange={(e) => updateField('text', e.target.value)}
        />
      </div>
      <div className="col-sm-2">
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
    <div className="panel-flex" style={{ flexDirection: 'column' }}>
      <div className="flex">
        <div className="col-sm-9">
          <Input
            placeholder="Header:"
            value={widget.text}
            onChange={(e) => updateField('text', e.target.value)}
          />
        </div>
        <div className="col-sm-3">
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
