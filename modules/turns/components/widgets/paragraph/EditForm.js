import { Input, Switch } from 'antd';
import { WIDGET_PARAGRAPH, widgetSettings } from '@/modules/turns/settings';

export const ParagraphAddForm = ({
  widgetBlock: widget,
  updateWidgetBlock,
}) => {
  const settings = widgetSettings[WIDGET_PARAGRAPH];

  const updateField = (field, value) => {
    updateWidgetBlock({
      ...widget,
      [field]: value,
    });
  };

  return (
    <div className="panel-flex">
      <div className="col-sm-9">
        <Input.TextArea
          placeholder="Text:"
          value={widget?.inserts[0]?.insert}
          onChange={(e) => updateField('inserts', [{ insert: e.target.value }])}
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
  );
};
