import { Input, Switch } from 'antd';
import { WIDGET_VIDEO, widgetSettings } from '@/modules/turns/settings';

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const VideoAddForm = ({ widgetBlock: widget, updateWidgetBlock }) => {
  const settings = widgetSettings[WIDGET_VIDEO];

  const updateField = (field, value) => {
    updateWidgetBlock({
      ...widget,
      [field]: value,
    });
  };

  return (
    <div className="panel-flex">
      <div className="w-3/4">
        <Input
          placeholder={`${capitalizeFirstLetter(widget.provider)} video:`}
          value={widget.url}
          onChange={(e) => updateField('url', e.target.value)}
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
  );
};
