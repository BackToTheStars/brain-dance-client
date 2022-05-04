import { changeWidgetParams } from '@/modules/panels/redux/actions';
import { PANEL_CHANGE_WIDGET_PARAMS } from '@/modules/panels/redux/types';
import { useEffect, useState } from 'react';
import ReactCrop from 'react-image-crop';
import { useDispatch } from 'react-redux';

const PictureCrop = ({ imageUrl, widgetKey }) => {
  const dispatch = useDispatch();

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

  useEffect(() => {
    console.log({ crop });
    dispatch(changeWidgetParams({ widgetKey, params: crop }));
  }, [crop]);

  return (
    <ReactCrop
      src={imageUrl}
      className="picture-react-crop"
      crop={crop}
      onChange={(newCrop) => setCrop(newCrop)}
    />
  );
};

export default PictureCrop;
