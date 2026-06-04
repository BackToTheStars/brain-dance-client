import { DatePicker, Input, Switch } from 'antd';
import { WIDGET_SOURCE, widgetSettings } from '@/modules/turns/settings';
import dayjs from 'dayjs';

export const SourceAddForm = ({ widgetBlock: widget, updateWidgetBlock }) => {
  const settings = widgetSettings[WIDGET_SOURCE];

  const updateField = (field, value) => {
    updateWidgetBlock({
      ...widget,
      [field]: value,
    });
  };

  return (
    <div className="panel-flex">
      <div className="w-3/4 row">
        <div className="w-3/4">
          <Input
            placeholder="URL:"
            value={widget.url}
            onChange={(e) => updateField('url', e.target.value)}
          />
        </div>
        <div className="w-1/4">
          <DatePicker
            value={widget.date ? dayjs(widget.date) : null}
            style={{ width: '100%' }}
            onChange={(d) => {
              updateField('date', d?.format('YYYY-MM-DD'));
            }}
          />
        </div>
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
  );
};
