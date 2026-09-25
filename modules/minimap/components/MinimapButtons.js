import { toggleMinimizePanel } from '@/modules/panels/redux/actions';
import { PANEL_MINIMAP } from '@/config/panel';
import { useDispatch } from 'react-redux';
import MapIcon from '@/modules/ui/icons/MapIcon';

const MinimapButtons = ({
  minimapSizePercents,
  setMinimapSizePercents,
  isMinimized,
}) => {
  const handleMapMinus = () => {
    if (minimapSizePercents <= 30) return false;
    setMinimapSizePercents(minimapSizePercents - 10);
  };

  const handleMapPlus = () => {
    if (minimapSizePercents >= 200) return false;
    setMinimapSizePercents(minimapSizePercents + 10);
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
            >
              <path
                d="M2.25 7.875H15.75C16.371 7.875 16.875 8.379 16.875 9C16.875 9.621 16.371 10.125 15.75 10.125H2.25C1.629 10.125 1.125 9.621 1.125 9C1.125 8.379 1.629 7.875 2.25 7.875Z"
                fill="#8097A1"
              />
            </svg>

            <div className="map-percent-value">{minimapSizePercents}%</div>

            <svg
              width={17}
              height={17}
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="map-plus"
              onClick={handleMapPlus}
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
