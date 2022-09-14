import { useDispatch } from 'react-redux';
import { uploadImage } from '../../redux/actions';
import { useDropzone } from 'react-dropzone';
import { useCallback } from 'react';

const ImageUploading = ({ setImageUrl }) => {
  const dispatch = useDispatch();

  const submitData = ({ image }) => {
    dispatch(uploadImage(image)).then((data) => {
      setImageUrl(data.src);
    });
  };

  const onDrop = useCallback(
    (acceptedFiles) => {
      /*console.log({ acceptedFiles });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(acceptedFiles[0]);
    inputRef.current.files = dataTransfer.files;*/
      submitData({ image: acceptedFiles[0] });
    },
    [submitData]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="drag-n-drop" {...getRootProps()}>
      <input {...getInputProps()} />

      {isDragActive ? (
        <p>Drop the files here ...</p>
      ) : (
        <p>Drag 'n' drop an image, or click to add</p>
      )}
    </div>
  );
};

export default ImageUploading;
