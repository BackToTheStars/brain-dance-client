// Выделение области на активной странице PDF. Интерфейс намеренно тот же, что у
// картинки (react-image-crop), только вместо картинки — прозрачная заглушка
// по размеру страницы: рисовать поверх canvas'а иначе нечем, а привычки
// пользователя ломать не хочется.

import { WIDGET_PICTURE_CROP_TIMEOUT_DELAY } from '@/config/ui';
import { changeWidgetParams } from '@/modules/panels/redux/actions';
import { useEffect, useRef, useState } from 'react';
import ReactCrop from 'react-image-crop';
import { useDispatch } from 'react-redux';
import { getQueue } from '../../helpers/queueHelper';

// прозрачный gif 1x1, растягивается на весь бокс страницы
const TRANSPARENT_PIXEL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

const round100 = (num) => Math.round(num * 100) / 100;

const PdfCrop = ({ widgetKey, activeQuoteId, activePage, initialQuote }) => {
  const dispatch = useDispatch();
  const cropQueue = useRef(getQueue(WIDGET_PICTURE_CROP_TIMEOUT_DELAY)).current;
  const [crop, setCrop] = useState();

  const params = useRef({ activeQuoteId, activePage });
  params.current = { activeQuoteId, activePage };

  // правка существующей цитаты: показываем её текущую рамку и сразу кладём в
  // стор, чтобы «Save Area» без перерисовки сохраняла прежнюю геометрию
  useEffect(() => {
    if (!initialQuote) {
      setCrop(undefined);
      return;
    }
    const initialCrop = {
      unit: '%',
      x: initialQuote.x,
      y: initialQuote.y,
      width: initialQuote.width,
      height: initialQuote.height,
    };
    setCrop(initialCrop);
    dispatch(
      changeWidgetParams({
        widgetKey,
        params: { crop: initialCrop, activeQuoteId, activePage },
      }),
    );
  }, [activeQuoteId, initialQuote?.id]);

  useEffect(() => {
    if (!crop) return;
    cropQueue.add(() => {
      dispatch(
        changeWidgetParams({
          widgetKey,
          params: {
            crop: {
              ...crop,
              width: round100(crop.width),
              height: round100(crop.height),
              x: round100(crop.x),
              y: round100(crop.y),
            },
            activeQuoteId: params.current.activeQuoteId,
            activePage: params.current.activePage,
          },
        }),
      );
    });
  }, [crop]);

  return (
    <ReactCrop
      className="pdf-react-crop"
      crop={crop}
      onChange={(newCrop, newPercentCrop) => {
        setCrop(newPercentCrop);
      }}
    >
      <img src={TRANSPARENT_PIXEL} alt="" className="pdf-react-crop__plate" />
    </ReactCrop>
  );
};

export default PdfCrop;
