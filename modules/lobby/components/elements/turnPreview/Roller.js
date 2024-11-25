import {
  SLIDER_MODAL_GAME,
  SLIDER_MODAL_TURN,
} from '@/config/lobby/sliderModal';
import { toggleSliderModal } from '@/modules/lobby/redux/actions';
import { ContentButton as Button } from '@/ui/button';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

const TurnPreviewRoller = ({ turn }) => {
  const dGames = useSelector((s) => s.lobby.dGames);
  const cardPadding = useSelector((s) => s.lobby.textSettings.padding);
  const t = useTranslations('Lobby.game');
  const dispatch = useDispatch();

  const game = useMemo(() => dGames[turn?.gameId], [turn, dGames]);
  const rollerStyle = useMemo(() => {
    return {
      padding: `${cardPadding}px`,
    };
  }, [cardPadding]);

  return (
    <div className="base-card__roller" style={rollerStyle}>
      {game?.name && <div className="mb-2">{game.name}</div>}
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() =>
            dispatch(toggleSliderModal(SLIDER_MODAL_GAME, { hash: game.hash }))
          }
        >
          {t('Game_info')}
        </Button>
        <Button
          size="sm"
          onClick={() =>
            dispatch(toggleSliderModal(SLIDER_MODAL_TURN, { id: turn._id }))
          }
        >
          {t('Turn_info')}
        </Button>
      </div>
    </div>
  );
};

export default TurnPreviewRoller;
