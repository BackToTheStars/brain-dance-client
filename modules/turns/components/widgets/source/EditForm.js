import { DatePicker, Input, Switch } from 'antd';
import { WIDGET_SOURCE, widgetSettings } from '@/modules/turns/settings';
import moment from 'moment';

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
      <div className="col-sm-9 row">
        <div className="col-sm-9">
          <Input
            placeholder="URL:"
            value={widget.url}
            onChange={(e) => updateField('url', e.target.value)}
          />
        </div>
        <div className="col-sm-3">
          <DatePicker
            value={widget.date ? moment(widget.date) : null}
            style={{ width: '100%' }}
            onChange={(moment) => {
              updateField('date', moment?.format('YYYY-MM-DD'));
            }}
          />
        </div>
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
  );
};
