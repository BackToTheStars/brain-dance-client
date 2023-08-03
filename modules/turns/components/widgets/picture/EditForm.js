import { Button, Input } from 'antd';
import FormInput from '../../forms/FormInput';
import ImageUploading from '../../forms/ImageUploading';
import { WIDGET_PICTURE, widgetSettings } from '@/modules/turns/settings';
// import { SourceAddForm } from '../source/EditForm';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { s } from '@/config/request';
import SubWidgetBlocks from '../../forms/SubWidgetBlocks';

const PictureAddForm = ({ widgetBlock: widget, updateWidgetBlock }) => {
  const field = 'url';
  const form = {};
  const settings = widgetSettings[WIDGET_PICTURE];

  const updateField = (field, value) => {
    updateWidgetBlock({
      ...widget,
      [field]: value,
    });
  };

  // const sourceActions = {
  //   remove: (index) => {
  //     console.log({ index });
  //     const sourcesCopy = [...widget.sources];
  //     updateField('sources', [
  //       ...sourcesCopy.slice(0, index),
  //       ...sourcesCopy.slice(index + 1),
  //     ]);
  //   },
  //   addBelow: () => {
  //     const sources = widget.sources || [];
  //     sources.push({ url: '', date: null });
  //     updateField('sources', sources);
  //   },
  // };

  const subWidgets = settings.subWidgets;

  // const [subWidget] = subWidgets
  // const s = subWidgets[0];

  return (
    <div>
      <FormInput
        changeHandler={(value) => updateField(field, value)}
        label={'Image URL'}
        prefixClass={'image-url'}
        inputType={'component'}
        key={field}
        value={widget[field] || ''}
        widgetSettings={{
          render: ({ changeHandler, label, prefixClass, value, form }) => {
            return (
              <>
                <Input
                  placeholder={`${label}:`}
                  value={value}
                  onChange={(e) => {
                    changeHandler(e.target.value);
                  }}
                />
                <ImageUploading setImageUrl={changeHandler} />
              </>
            );
          },
        }}
        form={widget}
      />
      {/* {subWidgets.map((s, i) => {
        s.actions = getSubWidgetActions(s.field, s.defaultData);
        return (
          <div key={i}>
            <h4>{s.label}</h4>
            {!!widget &&
              !!widget[s.field] &&
              widget[s.field].map((data, index) => {
                const Component = s.component;
                return (
                  <div className="d-flex" key={index}>
                    <div className="flex-1">
                      <Component
                        widgetBlock={data}
                        updateWidgetBlock={(newData) => {
                          const items = [...widget[s.field]];
                          items[index] = newData;
                          updateField(s.field, items);
                          // updateField(widget.sources.map((s, i) => i === index ? newSource : s))
                        }}
                      />
                    </div>
                    <div>
                      <Button onClick={() => s.actions.remove(index)}>
                        <DeleteOutlined />
                      </Button>
                    </div>
                  </div>
                );
              })}
            <Button onClick={s.actions.addBelow}>
              <PlusOutlined />
            </Button>
          </div>
        );
      })} */}

      <SubWidgetBlocks
        settings={settings}
        widget={widget}
        updateField={updateField}
      />
    </div>
  );
};

export default PictureAddForm;
