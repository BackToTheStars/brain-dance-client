import { toggleMinimizePanel } from '@/modules/panels/redux/actions';
import {
  MINIMAP_SIZE_MAX,
  MINIMAP_SIZE_MIN,
  MINIMAP_SIZE_STEP,
  PANEL_MINIMAP,
} from '@/config/panel';
import { useDispatch } from 'react-redux';
import MapIcon from '@/modules/ui/icons/MapIcon';
import { TID } from '@/config/testIds';

const MinimapButtons = ({
  minimapSizePercents,
  setMinimapSizePercents,
  isMinimized,
}) => {
  const handleMapMinus = () => {
    if (minimapSizePercents <= MINIMAP_SIZE_MIN) return false;
    setMinimapSizePercents(minimapSizePercents - MINIMAP_SIZE_STEP);
  };

  const handleMapPlus = () => {
    if (minimapSizePercents >= MINIMAP_SIZE_MAX) return false;
    setMinimapSizePercents(minimapSizePercents + MINIMAP_SIZE_STEP);
  };

  const dispatch = useDispatch();

  return (
    <div className="percent-map-wrap-holder">
      <div className="percent-map-wrap">
        <div className="map-icon">
          <MapIcon
            onClick={() =>
              dispatch(toggleMinimizePanel({ type: PANEL_MINIMAP }))
            }
            data-test-id={TID.minimap.toggle}
          />
        </div>
        {!isMinimized && (
          <>
            <svg
              width={17}
              height={17}
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="map-minus"
              onClick={handleMapMinus}
              data-test-id={TID.minimap.minus}
            >
              <path
                d="M2.25 7.875H15.75C16.371 7.875 16.875 8.379 16.875 9C16.875 9.621 16.371 10.125 15.75 10.125H2.25C1.629 10.125 1.125 9.621 1.125 9C1.125 8.379 1.629 7.875 2.25 7.875Z"
                fill="#8097A1"
              />
            </svg>

            <div
              className="map-percent-value"
              data-test-id={TID.minimap.size}
              data-size={minimapSizePercents}
            >
              {minimapSizePercents}%
            </div>

            <svg
              width={17}
              height={17}
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="map-plus"
              onClick={handleMapPlus}
              data-test-id={TID.minimap.plus}
            >
              <path
                d="M15.75 7.875H10.125V2.25C10.125 1.629 9.621 1.125 9 1.125C8.379 1.125 7.875 1.629 7.875 2.25V7.875H2.25C1.629 7.875 1.125 8.379 1.125 9C1.125 9.621 1.629 10.125 2.25 10.125H7.875V15.75C7.875 16.371 8.379 16.875 9 16.875C9.621 16.875 10.125 16.371 10.125 15.75V10.125H15.75C16.371 10.125 16.875 9.621 16.875 9C16.875 8.379 16.371 7.875 15.75 7.875Z"
                fill="#8097A1"
              />
            </svg>
          </>
        )}
      </div>
   
    </div>
  );
};

export default MinimapButtons;
