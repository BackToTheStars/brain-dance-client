import ColorSchemaSwitcher from '@/modules/ui/components/switchers/ColorSchemaSwitcher';
import ResetSwitcher from '@/modules/ui/components/switchers/ResetSwitcher';
import SizeSchemaSwitcher from '@/modules/ui/components/switchers/SizeSchemaSwitcher';
import { CookieContext } from 'app/ClientWrapper';
import { useContext } from 'react';
import { IntButton as Button } from '@/ui/button';
import { getStore, isStoreValid } from '@/modules/settings/redux/requests';
import ResetDataSwitcher from '@/modules/ui/components/switchers/ResetDataSwitcher';
import { openModal } from '@/modules/ui/redux/actions';
import { MODAL_UPLOAD } from '@/config/lobby/modal';
import { useDispatch } from 'react-redux';

const downloadFile = (data = {}) => {
  // create file in browser
  const fileName = 'settings';
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const href = URL.createObjectURL(blob);

  // create "a" HTLM element with href to file
  const link = document.createElement('a');
  link.href = href;
  link.download = fileName + '.json';
  document.body.appendChild(link);
  link.click();

  // clean up "a" element & remove ObjectURL
  document.body.removeChild(link);
  URL.revokeObjectURL(href);
};

const SwitchersBlock = () => {
  const { cookieColorSchema, cookieSizeSchema, cookieMode } =
    useContext(CookieContext);

  const dispatch = useDispatch();
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
            downloadFile(getStore());
          }}
        >
          Export
        </Button>
        <Button
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            dispatch(
              openModal(MODAL_UPLOAD, {
                text: 'Загрузите файл импорта',
                callback: (files) => {
                  const file = files[0];
                  if (file.type !== 'application/json') {
                    alert('Файл должен быть в формате JSON');
                    return;
                  }
                  const reader = new FileReader();
                  reader.readAsText(file, 'UTF-8');
                  reader.onload = (e) => {
                    try {
                      const jsonObj = JSON.parse(e.target.result);
                      const [valid, error] = isStoreValid(jsonObj);
                      if (!valid) {
                        alert(error);
                        return;
                      }
                      // dispatch(openModal(MODAL_SET_STORE, { store: jsonObj }));
                    } catch (error) {
                      console.log(error)
                      alert('Файл импорта имеет неверный формат');
                    }
                  };
                },
              }),
            );
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
