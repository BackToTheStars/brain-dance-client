import { SLIDER_MODAL_GAME, SLIDER_MODAL_TURN } from '@/config/lobby/sliderModal';
import { toggleSliderModal } from '@/modules/lobby/redux/actions';
import { ContentButton as Button } from '@/ui/button';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const getVideoImg = (url) => {
  if (url.match(/^(http[s]?:\/\/|)(www.|)youtu(.be|be.com)\//)) {
    const newVideoUrl = url.split('=')[1];
    return `https://img.youtube.com/vi/${newVideoUrl}/0.jpg`;
  } else {
    return '';
  }
};

const minHeight = 150;

const TurnCard = ({ id }) => {
  const t = useTranslations('Lobby.game');
  const dispatch = useDispatch();
  const dGames = useSelector((s) => s.lobby.dGames);
  const turn = useSelector((s) => s.lobby.dTurns[id]);
  const lineCount = useSelector((s) => s.lobby.textSettings.lineCount);
  const fontSize = useSelector((s) => s.lobby.textSettings.fontSize);
  const lineSpacing = useSelector((s) => s.lobby.textSettings.lineSpacing);
  const alignment = useSelector((s) => s.lobby.textSettings.alignment);
  const cardPadding = useSelector((s) => s.lobby.textSettings.padding);
  const activeFontFamily = useSelector(
    (s) => s.lobby.textSettings.activeFontFamily,
  );
  const limitLineHeader = useSelector(
    (s) => s.lobby.textSettings.limitLineHeader,
  );
  const { dontShowHeader, header, imageUrl, videoUrl, paragraph, contentType } =
    turn || {};
  let text = (paragraph && paragraph[0]?.insert) || null;
  if (text) {
    text =
      text.length > 300 ? text.slice(0, text.indexOf(' ', 300)) + ' ...' : text;
  }

  const game = dGames[turn?.gameId];
  const imageSrc = useMemo(() => {
    if (imageUrl) return imageUrl;
    if (videoUrl) return getVideoImg(videoUrl);
    return null;
  }, [imageUrl, videoUrl]);

  const headerLimiterStyle = useMemo(
    () => ({
      WebkitLineClamp: limitLineHeader,
    }),
    [limitLineHeader],
  );

  const maxHeight = useMemo(() => {
    const maxHeightLimit = 1600;
    const newHeight = lineSpacing * fontSize * lineCount + 16;
    if (newHeight > maxHeightLimit) {
      return maxHeightLimit;
    }
    return newHeight;
  }, [lineCount, fontSize, lineSpacing]);

  const wrapperStyle = useMemo(() => {
    return {
      minHeight: `${minHeight}px`,
      maxHeight: `${maxHeight}px`,
    }
  }, [minHeight, maxHeight]);

  const textStyle = useMemo(() => {
    return {
      fontSize: `${fontSize}px`,
      lineHeight: `${lineSpacing * fontSize}px`,
      textAlign: alignment,
    }
  }, [fontSize, lineSpacing, alignment, activeFontFamily]);

  const paddingStyle = useMemo(() => {
    return {
      padding: `${cardPadding}px`,
    }
  }, [cardPadding]);

  return (
    <div className="base-card base-card_turn" style={wrapperStyle}>
      {!dontShowHeader && (
        <div className="base-card__header" style={paddingStyle}>
          <div className="lines-limiter" style={headerLimiterStyle}>
            {header}
          </div>
        </div>
      )}
      <div className="base-card__body" style={paddingStyle}>
        {!!imageSrc && (
          <img
            src={imageSrc}
            alt="#"
            className={`base-card__widget w-full h-auto rounded mb-3`}
          />
        )}
        {!!text && (
          <div className="base-card__widget" style={textStyle}>
            {text}
          </div>
        )}
        {/* <Button
          size="sm"
          onClick={() => dispatch(toggleSliderModal(SLIDER_MODAL_TURN, { id }))}
        >
          Open
        </Button> */}
      </div>
      <div className="base-card__roller" style={paddingStyle}>
        {game?.name && <div className="mb-2">{game.name}</div>}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() =>
              dispatch(
                toggleSliderModal(SLIDER_MODAL_GAME, { hash: game.hash }),
              )
            }
          >
            {t('Game_info')}
          </Button>
          <Button
            size="sm"
            onClick={() =>
              dispatch(toggleSliderModal(SLIDER_MODAL_TURN, { id }))
            }
          >
            {t('Turn_info')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TurnCard;
