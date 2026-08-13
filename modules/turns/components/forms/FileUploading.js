import { useDispatch } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import { useCallback, useState } from 'react';
import { Spin } from 'antd';

// accept — формат react-dropzone: { 'application/pdf': ['.pdf'] }; без него принимается
// любой файл (media всё равно проверяет расширение и размер и вернёт понятную ошибку).
const FileUploading = ({
  changeHandler,
  fileTypeLabel = 'a file',
  uploadFunc = () => {},
  accept,
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitData = ({ file }) => {
    setError(null);
    setLoading(true);
    dispatch(uploadFunc(file))
      .then((data) => {
        changeHandler(data.src);
      })
      .catch((err) => {
        setError(err?.message || 'Upload failed');
      })
      .finally(() => {
        setLoading(false);
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

  return (
    <>
      <div className="drag-n-drop" {...getRootProps()}>
        <input {...getInputProps()} />

        {/* не <p>: antd Spin рисует div, вложенный div в p — ошибка гидратации */}
        {loading ? (
          <div className="drag-n-drop-loading">
            <Spin size="small" /> Uploading...
          </div>
        ) : isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag 'n' drop {fileTypeLabel}, or click to add</p>
        )}
      </div>

      {!!error && <div className="drag-n-drop-error">{error}</div>}
    </>
  );
};

export default FileUploading;
