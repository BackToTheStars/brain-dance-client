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
  const settings = widgetSettings[WIDGET_PICTURE];

  const updateField = (field, value) => {
    updateWidgetBlock({
      ...widget,
      [field]: value,
    });
  };

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
      <SubWidgetBlocks
        settings={settings}
        widget={widget}
        updateField={updateField}
      />
    </div>
  );
};

export default PictureAddForm;
