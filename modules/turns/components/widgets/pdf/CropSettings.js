// Окно настройки обрезки полей: рамка «видимая область» поверх страницы,
// показанной целиком, плюс четыре числа в процентах для точности. Черновик
// целиком живёт в editWidgetParams (панель применяет его кнопкой Save Crop),
// поэтому рамка и числа не могут разойтись.

import { TID } from '@/config/testIds';
import { changeWidgetParams } from '@/modules/panels/redux/actions';
import ReactCrop from 'react-image-crop';
import { useDispatch } from 'react-redux';
import {
  CROP_SIDES,
  clampCrop,
  cropToFrame,
  frameToCrop,
} from './cropGeometry';

// прозрачный gif 1x1, растягивается на весь бокс страницы
const TRANSPARENT_PIXEL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

const toPercent = (fraction) => Math.round(fraction * 1000) / 10;

const useCropDraft = (widgetKey, crop, activePage) => {
  const dispatch = useDispatch();
  return (next) =>
    dispatch(
      changeWidgetParams({
        widgetKey,
        params: { activePage, pdfCrop: clampCrop(next) },
      }),
    );
};

export const PdfCropFrame = ({ widgetKey, crop, activePage }) => {
  const setCrop = useCropDraft(widgetKey, crop, activePage);

  return (
    <ReactCrop
      className="pdf-react-crop"
      crop={cropToFrame(crop)}
      onChange={(newCrop, newPercentCrop) => setCrop(frameToCrop(newPercentCrop))}
    >
      <img
        src={TRANSPARENT_PIXEL}
        alt=""
        className="pdf-react-crop__plate"
        data-test-id={TID.pdf.cropFrame}
      />
    </ReactCrop>
  );
};

export const PdfCropFields = ({ widgetKey, crop, activePage }) => {
  const setCrop = useCropDraft(widgetKey, crop, activePage);

  return (
    <div
      className="pdf-crop-fields not-draggable"
      data-test-id={TID.pdf.cropSettings}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {CROP_SIDES.map((side) => (
        <label key={side} className="pdf-crop-fields__item">
          <span>{side}</span>
          <input
            type="number"
            min="0"
            max="95"
            step="0.5"
            data-test-id={TID.pdf.cropSide(side)}
            value={toPercent(crop[side])}
            onChange={(e) =>
              setCrop({ ...crop, [side]: Number(e.target.value) / 100 })
            }
          />
        </label>
      ))}
    </div>
  );
};
