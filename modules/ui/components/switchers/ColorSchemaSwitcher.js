import { schemas } from '@/config/ui/color';
import { setColorSchema } from '@/modules/ui/redux/actions';
import { Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import BaseSwitcher from './BaseSwitcher';

const ColorSchemaSwitcher = ({ defaultColorSchema = '' }) => {
  return (
    <BaseSwitcher
      options={schemas}
      selector={(state) => state.ui.themeSettings.colorSchema}
      defaultVal={defaultColorSchema}
      setVal={setColorSchema}
    />
  );
  // const colorSchema =
  //   useSelector((state) => state.ui.themeSettings.colorSchema) || defaultColorSchema;
  // const dispatch = useDispatch();

  // return (
  //   <div>
  //     <Select
  //       size="small"
  //       value={colorSchema}
  //       loading={!colorSchema}
  //       onChange={(value) => dispatch(setColorSchema(value))}
  //     >
  //       {schemas.map((schema) => (
  //         <Select.Option key={schema.value} value={schema.value}>
  //           {schema.label}
  //         </Select.Option>
  //       ))}
  //     </Select>
  //   </div>
  // );
};

export default ColorSchemaSwitcher;
