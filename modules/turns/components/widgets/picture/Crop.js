import { useState } from 'react';
import ReactCrop from 'react-image-crop';

const PictureCrop = ({imageUrl}) => {
  const [crop, setCrop] = useState({
    unit: '%',
    // x: 10,
    // y: 10,
    // width: 20,
    // height: 20,
  });

  // useEffect(() => {
  //     const quote = quotes.find((quote) => quote.id === activeQuote.quoteId);
  //     const { x, y, height, width } = quote;
  //     setCrop({ unit: '%', x, y, width, height });
  // }, []);

  return (
    <ReactCrop
      src={imageUrl}
      className="picture-react-crop"
      crop={crop}
      onChange={(newCrop) => setCrop(newCrop)}
    />
  )
}

export default PictureCrop