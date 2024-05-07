'use client';
import { modes } from '@/config/ui/mode';
import { setMode } from '@/modules/ui/redux/actions';
import BaseSwitcher from './BaseSwitcher';

const ModeToggle = ({ defaultMode = '' }) => {
  return (
    <BaseSwitcher
      options={modes}
      selector={(state) => state.ui.themeSettings.mode}
      defaultVal={defaultMode}
      setVal={setMode}
    />
  );
};

export default ModeToggle;
