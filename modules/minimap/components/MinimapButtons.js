import { toggleMinimizePanel } from '@/modules/panels/redux/actions';
import { PANEL_MINIMAP } from '@/modules/panels/settings';
import { useDispatch } from 'react-redux';

const MinimapButtons = ({
  minimapSizePercents,
  setMinimapSizePercents,
  isMinimized,
}) => {
  const handleMapMinus = () => {
    if (minimapSizePercents <= 60) return false;
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
          <svg
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            onClick={() =>
              dispatch(toggleMinimizePanel({ type: PANEL_MINIMAP }))
            }
          >
            <path
              d="M15 4L9 7M9 20L3.55279 17.2764C3.214 17.107 3 16.7607 3 16.382V5.61803C3 4.87465 3.78231 4.39116 4.44721 4.72361L9 7V20ZM9 20L15 17L9 20ZM9 20V7V20ZM15 17L19.5528 19.2764C20.2177 19.6088 21 19.1253 21 18.382V7.61803C21 7.23926 20.786 6.893 20.4472 6.72361L15 4V17ZM15 17V4V17Z"
              stroke="white"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
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
