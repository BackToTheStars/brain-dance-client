import { schemas } from '@/config/ui/color';
import { setColorSchema } from '@/modules/ui/redux/actions';
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
};

export default ColorSchemaSwitcher;
