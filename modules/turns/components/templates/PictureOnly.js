import { Input } from 'antd';
import FormInput from '../forms/FormInput';
import ImageUploading from '../forms/ImageUploading';

const PictureOnlyTemplate = () => {
  const field = 'imageUrl';
  const form = {};
  const formChangeHandler = () => {};

  return (
    <div>
      <FormInput
        changeHandler={(value) => formChangeHandler(field, value)}
        label={'Image URL'}
        prefixClass={'image-url'}
        inputType={'component'}
        key={field}
        value={form[field] || ''}
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
        form={form}
      />
    </div>
  );
};

export default PictureOnlyTemplate;
