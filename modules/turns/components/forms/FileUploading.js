import { useDispatch } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import { useCallback, useState } from 'react';
import { Progress, Spin } from 'antd';
import { TID } from '@/config/testIds';

// accept — формат react-dropzone: { 'application/pdf': ['.pdf'] }; без него принимается
// любой файл (media всё равно проверяет расширение и размер и вернёт понятную ошибку).
const FileUploading = ({
  changeHandler,
  fileTypeLabel = 'a file',
  uploadFunc = () => {},
  accept,
  uploadType, // images | videos | audios | pdfs — только для data-upload-type
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  // null — отправка ещё не началась; 0..100 — доля ушедшего тела запроса
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);

  const submitData = ({ file }) => {
    setError(null);
    setProgress(null);
    setLoading(true);
    dispatch(uploadFunc(file, setProgress))
      .then((data) => {
        changeHandler(data.src);
      })
      .catch((err) => {
        setError(err?.message || 'Upload failed');
      })
      .finally(() => {
        setLoading(false);
        setProgress(null);
      });
  };

  const onDrop = useCallback(
    (acceptedFiles, rejections) => {
      if (!acceptedFiles.length) {
        // файл не прошёл фильтр accept — без сообщения выглядит как «ничего не произошло»
        setError(rejections?.length ? 'Wrong file type' : null);
        return;
      }
      submitData({ file: acceptedFiles[0] });
    },
    [submitData],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    isDragActive: true,
    accept,
    multiple: false,
    disabled: loading,
  });

  // после 100 % полоса бесполезна: тело ушло целиком, но media ещё пишет файл в GridFS —
  // на крупном файле это выглядит как зависание, поэтому вторая фаза — спиннер
  const processing = loading && progress === 100;

  return (
    <>
      <div
        className="drag-n-drop"
        {...getRootProps()}
        data-test-id={TID.upload.dropzone}
        data-upload-type={uploadType}
      >
        <input {...getInputProps()} />

        {/* не <p>: antd Spin/Progress рисуют div, вложенный div в p — ошибка гидратации */}
        {loading ? (
          processing ? (
            <div
              className="drag-n-drop-loading"
              data-test-id={TID.upload.processing}
            >
              <Spin size="small" /> Processing...
            </div>
          ) : (
            <div
              className="drag-n-drop-progress"
              data-test-id={TID.upload.progress}
            >
              <div>Uploading...</div>
              {/* dropzone на время загрузки disabled, поэтому клик по полосе
                  диалог выбора файла не откроет */}
              <Progress percent={progress ?? 0} size="small" status="active" />
            </div>
          )
        ) : isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag 'n' drop {fileTypeLabel}, or click to add</p>
        )}
      </div>

      {!!error && (
        <div className="drag-n-drop-error" data-test-id={TID.upload.error}>
          {error}
        </div>
      )}
    </>
  );
};

export default FileUploading;
