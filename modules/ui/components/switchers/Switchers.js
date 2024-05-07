import ModeToggle from '@/modules/ui/components/switchers/ModeToggle';
import ColorSchemaSwitcher from '@/modules/ui/components/switchers/ColorSchemaSwitcher';
import SizeSchemaSwitcher from '@/modules/ui/components/switchers/SizeSchemaSwitcher';
import { useContext } from 'react';
import { CookieContext } from 'app/ClientWrapper';
import ResetSwitcher from '@/modules/ui/components/switchers/ResetSwitcher';

const Switchers = () => {
  const { cookieColorSchema, cookieSizeSchema, cookieMode } = useContext(CookieContext);

  return (
    <div className="flex flex-wrap gap-4">
      <ModeToggle defaultMode={cookieMode} />
      <ColorSchemaSwitcher defaultColorSchema={cookieColorSchema} />
      <SizeSchemaSwitcher defaultSizeSchema={cookieSizeSchema} />
      <ResetSwitcher />
    </div>
  );
};

export default Switchers;