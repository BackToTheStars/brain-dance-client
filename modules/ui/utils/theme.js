import { defaultSchema as defaultColorSchema } from '@/config/ui/color';
import { defaultSchema as defaultSizeSchema } from '@/config/ui/size';
import { defaultMode } from '@/config/ui/mode';

export const getBodyClasses = (
  colorSchema = defaultColorSchema,
  sizeSchema = defaultSizeSchema,
  mode = defaultMode,
) => {
  const bodyClassNames = `custom-theme ${colorSchema}-schema ${sizeSchema}-sizes ${mode}`;
  return bodyClassNames;
};
