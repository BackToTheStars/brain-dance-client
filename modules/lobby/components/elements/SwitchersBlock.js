import ColorSchemaSwitcher from '@/modules/ui/components/switchers/ColorSchemaSwitcher';
import ResetSwitcher from '@/modules/ui/components/switchers/ResetSwitcher';
import SizeSchemaSwitcher from '@/modules/ui/components/switchers/SizeSchemaSwitcher';
import { CookieContext } from 'app/ClientWrapper';
import { useContext } from 'react';
import { IntButton as Button } from '@/ui/button';
import ResetDataSwitcher from '@/modules/ui/components/switchers/ResetDataSwitcher';

const downloadFile = () => {
  // create file in browser
  const fileName = "settings";
  const json = JSON.stringify({}, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const href = URL.createObjectURL(blob);

  // create "a" HTLM element with href to file
  const link = document.createElement("a");
  link.href = href;
  link.download = fileName + ".json";
  document.body.appendChild(link);
  link.click();

  // clean up "a" element & remove ObjectURL
  document.body.removeChild(link);
  URL.revokeObjectURL(href);
}

const SwitchersBlock = () => {
  const { cookieColorSchema, cookieSizeSchema, cookieMode } =
    useContext(CookieContext);

  return (
    <>
      <div className="flex flex-wrap gap-3 pt-3">
        <ColorSchemaSwitcher defaultColorSchema={cookieColorSchema} />
        <SizeSchemaSwitcher defaultSizeSchema={cookieSizeSchema} />
        <ResetSwitcher />
      </div>
      <div className="flex flex-wrap gap-3 pt-3">
        <Button
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            downloadFile();
          }}
        >
          Export
        </Button>
        <Button
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            downloadFile();
          }}
        >
          Import
        </Button>
        <ResetDataSwitcher />
      </div>
    </>
  );
};

export default SwitchersBlock;
