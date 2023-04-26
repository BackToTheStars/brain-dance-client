import { WIDGET_PICTURE_CROP_TIMEOUT_DELAY } from '@/config/ui';
import { changeWidgetParams } from '@/modules/panels/redux/actions';
import { useEffect, useState } from 'react';
import ReactCrop from 'react-image-crop';
import { useDispatch, useSelector } from 'react-redux';
import { getQueue } from '../../helpers/queueHelper';

const cropQueue = getQueue(WIDGET_PICTURE_CROP_TIMEOUT_DELAY);

const PictureCrop = ({ imageUrl, widgetKey, stateCrop, activeQuoteId }) => {
  const dispatch = useDispatch();

  const [crop, setCrop] = useState(
    stateCrop || {
      unit: '%',
      // x: 10,
      // y: 10,
      // width: 20,
      // height: 20,
    }
  );

  // useEffect(() => {
  //     const quote = quotes.find((quote) => quote.id === activeQuote.quoteId);
  //     const { x, y, height, width } = quote;
  //     setCrop({ unit: '%', x, y, width, height });
  // }, []);

  useEffect(() => {
    cropQueue.add(() => {
      dispatch(
        changeWidgetParams({
          widgetKey,
          params: {
            crop: {
              ...crop,
              width: Math.round(crop.width * 100) / 100,
              height: Math.round(crop.height * 100) / 100,
              x: Math.round(crop.x * 100) / 100,
              y: Math.round(crop.y * 100) / 100,
            },
            activeQuoteId,
          },
        })
      );
    });
  }, [crop]);

  return (
    <ReactCrop
      src={imageUrl}
      className="picture-react-crop"
      crop={crop}
      onChange={(newCrop, newPercentCrop) => {
        setCrop(newPercentCrop);
      }}
    />
  );
};

export default PictureCrop;
