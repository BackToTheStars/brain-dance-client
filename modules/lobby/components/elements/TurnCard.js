import { SLIDER_MODAL_TURN } from '@/config/lobby/sliderModal';
import { toggleSliderModal } from '@/modules/lobby/redux/actions';
import { ContentButton as Button } from '@/ui/button';
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

const TurnCard = ({ id }) => {
  const turn = useSelector((s) => s.lobby.dTurns[id]);
  const { dontShowHeader, header, imageUrl, videoUrl, paragraph, contentType } =
    turn || {};
  const dispatch = useDispatch();
  let text = (paragraph && paragraph[0]?.insert) || null;
  if (text) {
    text = text.length > 300 ? text.slice(0, text.indexOf(' ', 300)) + ' ...' : text;
  }
  const imageSrc = useMemo(() => {
    if (imageUrl) return imageUrl;
    if (videoUrl) return getVideoImg(videoUrl);
    return null;
  }, [imageUrl, videoUrl])

  return (
    <div className="base-card base-card_turn">
      {!dontShowHeader && (
        <div className="base-card__header">
          {header}
        </div>
      )}
      <div className="base-card__body">
        {!!imageSrc && (
          <img src={imageSrc} alt="#" className={`base-card__widget w-full h-auto rounded mb-3`} />
        )}
        {!!text && (
          <div className="base-card__widget">{text}</div>
        )}
        {/* <Button
          size="sm"
          onClick={() => dispatch(toggleSliderModal(SLIDER_MODAL_TURN, { id }))}
        >
          Open
        </Button> */}
      </div>
    </div>
  );
};

export default TurnCard;
