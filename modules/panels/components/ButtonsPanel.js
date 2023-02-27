import { useSelector } from 'react-redux';
import {
  MODE_GAME,
  MODE_OPERATION_PASTE,
  MODE_WIDGET_PARAGRAPH,
  MODE_WIDGET_PICTURE,
  MODE_WIDGET_PICTURE_QUOTE_ACTIVE,
  MODE_WIDGET_PICTURE_QUOTE_ADD,
} from '../settings';
import GameMode from './buttons/GameMode';
import TurnPasteMode from './buttons/operations/TurnPasteMode';
import ParagraphMode from './buttons/paragraph/ParagraphMode';
import PictureMode from './buttons/picture/PictureMode';
import PictureQuoteActive from './buttons/picture/PictureQuoteActive';
import PictureQuoteAdd from './buttons/picture/PictureQuoteAdd';

export const Buttons = ({ buttons }) => {
  // const disabled = useSelector((state) => state.ui.callsQueueIsBlocked);
  const disabled = false;

  const classNames = ['btn', 'btn-primary'];
  if (disabled) {
    classNames.push('disabled');
  }
  return (
    <>
      {buttons.map((button, index) =>
        !!button && (!button.show || button.show()) ? (
          <button
            key={index}
            className={classNames.join(' ')}
            onClick={() => !disabled && button.callback()}
          >
            {button.text}
          </button>
        ) : (
          <div key={index} className="empty-button-space"></div>
        )
      )}
    </>
  );
};

const ButtonsPanel = () => {
  const mode = useSelector((state) => state.panels.mode);

  const buttonSettings = {
    [MODE_GAME]: GameMode,
    [MODE_WIDGET_PICTURE]: PictureMode,
    [MODE_WIDGET_PICTURE_QUOTE_ADD]: PictureQuoteAdd,
    [MODE_WIDGET_PICTURE_QUOTE_ACTIVE]: PictureQuoteActive,
    [MODE_WIDGET_PARAGRAPH]: ParagraphMode,
    [MODE_OPERATION_PASTE]: TurnPasteMode,
  };

  const Component = buttonSettings[mode];

  return <Component />;
};

export default ButtonsPanel;
