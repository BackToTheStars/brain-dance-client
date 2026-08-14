import { useSelector } from 'react-redux';
import {
  MODE_GAME,
  MODE_OPERATION_PASTE,
  MODE_WIDGET_AUDIO,
  MODE_WIDGET_AUDIO_QUOTES_MANAGE,
  MODE_WIDGET_PARAGRAPH,
  MODE_WIDGET_PICTURE,
  MODE_WIDGET_PICTURE_QUOTE_ACTIVE,
  MODE_WIDGET_PICTURE_QUOTE_ADD,
  MODE_WIDGET_PDF,
  MODE_WIDGET_PDF_QUOTE_ACTIVE,
  MODE_WIDGET_PDF_QUOTE_ADD,
  MODE_WIDGET_VIDEO,
  MODE_WIDGET_VIDEO_QUOTES_MANAGE,
} from '@/config/panel';
import GameMode from './buttons/GameMode';
import TurnPasteMode from './buttons/operations/TurnPasteMode';
import ParagraphMode from './buttons/paragraph/ParagraphMode';
import PictureMode from './buttons/picture/PictureMode';
import PictureQuoteActive from './buttons/picture/PictureQuoteActive';
import PictureQuoteAdd from './buttons/picture/PictureQuoteAdd';
import { useMemo } from 'react';
import VideoMode from './buttons/video/VideoMode';
import VideoQuotesManage from './buttons/video/VideoQuotesManage';
import AudioQuotesManage from './buttons/audio/AudioQuotesManage';
import AudioMode from './buttons/audio/AudioMode';
import PdfMode from './buttons/pdf/PdfMode';
import PdfQuoteAdd from './buttons/pdf/PdfQuoteAdd';
import PdfQuoteActive from './buttons/pdf/PdfQuoteActive';

// Карта строится при рендере, а не при инициализации модуля. Чтение default'ов
// импортированных режимов на уровне модуля падало в прод-сборке
// («Cannot access 'm' before initialization»): при циклическом импорте порядок
// инициализации решает всё, и модуль режима мог быть ещё не выполнен.
// К моменту рендера все модули инициализированы, поэтому здесь это безопасно.
const getButtonSettings = () => ({
  [MODE_GAME]: GameMode,
  [MODE_WIDGET_PICTURE]: PictureMode,
  [MODE_WIDGET_PICTURE_QUOTE_ADD]: PictureQuoteAdd,
  [MODE_WIDGET_PICTURE_QUOTE_ACTIVE]: PictureQuoteActive,
  [MODE_WIDGET_PDF]: PdfMode,
  [MODE_WIDGET_PDF_QUOTE_ADD]: PdfQuoteAdd,
  [MODE_WIDGET_PDF_QUOTE_ACTIVE]: PdfQuoteActive,
  [MODE_WIDGET_PARAGRAPH]: ParagraphMode,
  [MODE_OPERATION_PASTE]: TurnPasteMode,
  [MODE_WIDGET_VIDEO]: VideoMode,
  [MODE_WIDGET_AUDIO]: AudioMode,
  [MODE_WIDGET_VIDEO_QUOTES_MANAGE]: VideoQuotesManage,
  [MODE_WIDGET_AUDIO_QUOTES_MANAGE]: AudioQuotesManage,
});

const ButtonsPanel = () => {
  const mode = useSelector((state) => state.panels.mode);
  const Component = useMemo(() => getButtonSettings()[mode], [mode]);
  return <Component />;
};

export default ButtonsPanel;
