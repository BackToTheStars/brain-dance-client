import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import TurnPreviewHeader from './turnPreview/Header';
import TurnPreviewWrapper from './turnPreview/Wrapper';
import TurnPreviewRoller from './turnPreview/Roller';
import TurnPreviewAudio from './turnPreview/Audio';
import TurnImage from './TurnImage';
import { getTurnPreviewSrc } from '../../utils/turnPreview';

const TurnCard = ({ id }) => {
  const turn = useSelector((s) => s.lobby.dTurns[id]);
  const fontSize = useSelector((s) => s.lobby.textSettings.fontSize);
  const lineSpacing = useSelector((s) => s.lobby.textSettings.lineSpacing);
  const alignment = useSelector((s) => s.lobby.textSettings.alignment);
  const cardPadding = useSelector((s) => s.lobby.textSettings.padding);

  const {
    dontShowHeader,
    header,
    imageUrl,
    videoUrl,
    videoPreview,
    audioUrl,
    paragraph,
    contentType,
  } = turn || {};
  // Превью — весь текст абзаца, а не первый инсерт: цитата, жирный или курсив бьют
  // абзац на несколько инсертов, и от карточки оставался бы кусок до первого из них.
  let text = (paragraph || [])
    .map((item) => (typeof item?.insert === 'string' ? item.insert : ''))
    .join('')
    .trim();
  if (text.length > 350) {
    const space = text.indexOf(' ', 350);
    text = `${text.slice(0, space === -1 ? 350 : space)} ...`;
  }

  const imageSrc = useMemo(
    () => getTurnPreviewSrc({ imageUrl, videoUrl, videoPreview }),
    [imageUrl, videoUrl, videoPreview],
  );

  const textStyle = useMemo(() => {
    return {
      fontSize: `${fontSize}px`,
      lineHeight: `${lineSpacing * fontSize}px`,
      textAlign: alignment,
    };
  }, [fontSize, lineSpacing, alignment]);

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
        {!!imageSrc && <TurnImage src={imageSrc} />}
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
