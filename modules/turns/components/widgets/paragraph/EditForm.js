// import { getQuill } from '@/modules/turns/components/helpers/quillHelper';
import { Input, Switch } from 'antd';
import { WIDGET_PARAGRAPH, widgetSettings } from '@/modules/turns/settings';
import { useEffect, useState } from 'react';

export const ParagraphAddForm = ({
  widgetBlock: widget,
  updateWidgetBlock,
}) => {
  const settings = widgetSettings[WIDGET_PARAGRAPH];
  const containerId = `quill-container-${widget.id}`;
  const toolbarId = `quill-toolbar-${widget.id}`;
  const [quillConstants, setQuillConstants] = useState({});

  const updateField = (field, value) => {
    updateWidgetBlock({
      ...widget,
      [field]: value,
    });
  };

  useEffect(() => {
    // @todo: fix quill
    return null;
    // const quillConstants = getQuill(`#${containerId}`, `#${toolbarId}`);
    // const { quill, getQuillTextArr } = quillConstants;
    // setQuillConstants(quillConstants);

    // quill.on('text-change', function () {
    //   updateField('inserts', getQuillTextArr());
    // });
  }, []);

  return (
    <div className="panel-flex">
      <div className="col-sm-9">
        {/* <Input.TextArea
          placeholder="Text:"
          value={widget?.inserts[0]?.insert}
          onChange={(e) => updateField('inserts', [{ insert: e.target.value }])}
        /> */}
        <div className="flex-1 quill-wrapper panel-cell mt-0">
          <div id={toolbarId}>
            <span className="ql-formats">
              <select className="ql-background">
                {[
                  '',
                  'rgb(255, 255, 0)',
                  'rgb(138, 255, 36)',
                  'rgb(253, 201, 255)',
                  'rgb(156, 245, 255)',
                  'rgb(210, 211, 212)',
                  'rgb(255, 213, 150)',
                ].map((val, i) => (
                  <option value={val} key={i} />
                ))}
              </select>
            </span>
          </div>
          <div id={containerId} />
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
