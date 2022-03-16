import { useSelector } from 'react-redux';
import { MODE_GAME } from '../settings';
import GameMode from './buttons/GameMode';

export const Buttons = ({ buttons }) => {
  return (
    <div className="actions panel">
      {buttons.map((button, index) =>
        !!button && (!button.show || button.show()) ? (
          <button
            key={index}
            className="btn  btn-primary"
            onClick={button.callback}
          >
            {button.text}
          </button>
        ) : (
          <div key={index} className="empty-button-space"></div>
        )
      )}
    </div>
  );
};

const ButtonsPanel = () => {
  const mode = useSelector((state) => state.panels.mode);

  const buttonSettings = {
    [MODE_GAME]: GameMode,
    // @learn 'game': ...
    // [MODE_WIDGET_PICTURE]: usePictureMode({
    //   setInteractionType,
    //   setInteractionMode,
    //   makeWidgetActive,
    //   dispatch,
    // }),
    // [MODE_WIDGET_PICTURE_QUOTE_ADD]: usePictureQuoteAdd({
    //   setInteractionMode,
    //   setInteractionType,
    //   performActions,
    // }),
    // [MODE_WIDGET_PICTURE_QUOTE_ACTIVE]: usePictureQuoteActive({
    //   setInteractionMode,
    //   setInteractionType,
    //   performActions,
    //   makeWidgetActive,
    //   dispatch,
    // }),
    // [MODE_WIDGET_PARAGRAPH]: useParagraphMode({
    //   setInteractionType,
    //   setInteractionMode,
    //   makeWidgetActive,
    //   // dispatch,
    // }),
  };

  const Component = buttonSettings[mode];

  return <Component />;
};

export default ButtonsPanel;
