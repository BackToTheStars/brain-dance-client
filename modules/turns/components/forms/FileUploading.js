import { useDispatch } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import { useCallback } from 'react';

const FileUploading = ({
  changeHandler,
  fileTypeLabel = 'a file',
  uploadFunc = () => {},
}) => {
  const dispatch = useDispatch();

  const submitData = ({ file }) => {
    dispatch(uploadFunc(file)).then((data) => {
      changeHandler(data.src);
    });
  };

  const onDrop = useCallback(
    (acceptedFiles) => {
      submitData({ file: acceptedFiles[0] });
    },
    [submitData],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    isDragActive: true,
  });

  return (
    <div className="drag-n-drop" {...getRootProps()}>
      <input {...getInputProps()} />

      {isDragActive ? (
        <p>Drop the files here ...</p>
      ) : (
        <p>Drag 'n' drop {fileTypeLabel}, or click to add</p>
      )}
    </div>
  );
};

export default FileUploading;
