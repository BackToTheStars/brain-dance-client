import { useDispatch } from 'react-redux';
import { uploadImage } from '../../redux/actions';

const ImageUploading = ({ setImageUrl }) => {
  const dispatch = useDispatch();

  const submitData = ({ image }) => {
    dispatch(uploadImage(image)).then((data) => {
      setImageUrl(data.src);
    });
  };

  return (
    <form
      encType="multipart/form-data"
      onSubmit={(e) => {
        e.preventDefault();
        submitData({
          image: e.target.image.files[0],
        });
      }}
    >
      <label className="col-form-label">
        Image
        <p></p>
        <input type="file" name="image" />
      </label>
      <p></p>
      <input type="submit" defaultValue="Submit" />
      <p></p>
    </form>
  );
};

export default ImageUploading;
