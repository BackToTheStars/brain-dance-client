import { schemas } from '@/config/ui/size';
import { setSizeSchema } from '@/modules/ui/redux/actions';
import BaseSwitcher from './BaseSwitcher';

const SizeSchemaSwitcher = ({ defaultSizeSchema = ''}) => {
  return (
    <BaseSwitcher
      options={schemas}
      selector={(state) => state.ui.themeSettings.sizeSchema}
      defaultVal={defaultSizeSchema}
      setVal={setSizeSchema}
    />
  );
};

export default SizeSchemaSwitcher;
