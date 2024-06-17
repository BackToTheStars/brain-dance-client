import { closeModal } from '@/modules/ui/redux/actions';
import { useDispatch } from 'react-redux';
import { IntButton as Button } from '@/ui/button';
import { useDropzone } from 'react-dropzone';
import { useTranslations } from 'next-intl';

const UploadModal = ({ params }) => {
  const t = useTranslations('Lobby');
  const { text = '', callback = () => {} } = params;

  const dispatch = useDispatch();
  const onCancel = () => dispatch(closeModal());

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: callback,
    isDragActive: true,
  });

  return (
    <div
      className="h-full flex flex-col"
      style={{
        height: '150px',
      }}
    >
      <div>{text}</div>
      <div className="flex-1">
        <div {...getRootProps()} className="drag-n-drop-file">
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>{t('uploadModal.Drag_drop')}</p>
          ) : (
            <p>{t('uploadModal.Click_or_drag')}</p>
          )}
        </div>
      </div>
      <div className="mt-3 text-end">
        <Button onClick={onCancel} className="mr-3">
          {t('Cancel')}
        </Button>
      </div>
    </div>
  );
};

export default UploadModal;
