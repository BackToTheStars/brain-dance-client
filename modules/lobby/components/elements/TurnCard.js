import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import TurnPreviewHeader from './turnPreview/Header';
import TurnPreviewWrapper from './turnPreview/Wrapper';
import TurnPreviewRoller from './turnPreview/Roller';
import TurnPreviewAudio from './turnPreview/Audio';

const getVideoImg = (videoUrl) => {
  if (videoUrl.match(/^(http[s]?:\/\/|)(www.|)youtu(.be|be.com)\//)) {
    const videoId = videoUrl.split('v=')[1] || videoUrl.split('/').at(-1);
    return `https://img.youtube.com/vi/${videoId}/0.jpg`;
  } else {
    return '/img/video-default.png';
  }
};

const TurnCard = ({ id }) => {
  const turn = useSelector((s) => s.lobby.dTurns[id]);
  const fontSize = useSelector((s) => s.lobby.textSettings.fontSize);
  const lineSpacing = useSelector((s) => s.lobby.textSettings.lineSpacing);
  const alignment = useSelector((s) => s.lobby.textSettings.alignment);
  const cardPadding = useSelector((s) => s.lobby.textSettings.padding);
  const activeFontFamily = useSelector(
    (s) => s.lobby.textSettings.activeFontFamily,
  );

  const {
    dontShowHeader,
    header,
    imageUrl,
    videoUrl,
    audioUrl,
    paragraph,
    contentType,
  } = turn || {};
  let text = (paragraph && paragraph[0]?.insert) || '';
  if (text) {
    text =
      text.length > 350 ? text.slice(0, text.indexOf(' ', 350)) + ' ...' : text;
  }
  text = text.trim();

  const imageSrc = useMemo(() => {
    if (imageUrl) return imageUrl;
    if (videoUrl) return getVideoImg(videoUrl);
    return null;
  }, [imageUrl, videoUrl]);

  const textStyle = useMemo(() => {
    return {
      fontSize: `${fontSize}px`,
      lineHeight: `${lineSpacing * fontSize}px`,
      textAlign: alignment,
    };
  }, [fontSize, lineSpacing, alignment, activeFontFamily]);

  const paddingStyle = useMemo(() => {
    return {
      padding: `${cardPadding}px`,
    };
  }, [cardPadding]);

  return (
    <TurnPreviewWrapper>
      {!dontShowHeader && !!header && <TurnPreviewHeader header={header} />}
      <div className="base-card__body" style={paddingStyle}>
        {!!audioUrl && <TurnPreviewAudio audioUrl={audioUrl} header={header} />}
        {!!imageSrc && (
          <img
            src={imageSrc}
            alt="#"
            className={`base-card__widget w-full h-auto rounded`}
          />
        )}
        {!!text && (
          <div className="base-card__widget" style={textStyle}>
            {text}
          </div>
        )}
      </div>
      <TurnPreviewRoller turn={turn} />
    </TurnPreviewWrapper>
  );
};

export default TurnCard;
