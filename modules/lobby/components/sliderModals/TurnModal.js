import { useSelector } from 'react-redux';
import { useTranslations } from 'next-intl';
import { ContentButton as Button } from '@/ui/button';
import { useMainLayoutContext } from '../layout/MainLayoutContext';
import { getGameUrl } from '../../utils/url';
import { getTurnPreviewSrc } from '../../utils/turnPreview';
import TurnImage from '../elements/TurnImage';
import { TID } from '@/config/testIds';

const limitLine = (line) => {
  return {
    WebkitLineClamp: `${line}`,
    WebkitBoxOrient: 'vertical',
    display: 'inline-block',
    display: '-webkit-box',
    maxHeight: 'auto',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };
};

const TurnModal = ({ params }) => {
  const { sliderWidth } = useMainLayoutContext();
  const { id } = params;
  const turn = useSelector((s) => s.lobby.dTurns[id]);
  const game = useSelector((s) => s.lobby.dGames[turn?.gameId]);
  const t = useTranslations('Lobby.game');
  const { header, paragraph, date } = turn || {};
  const newDate = new Date(date);
  const text = (paragraph && paragraph[0]?.insert) || null;
  const previewSrc = getTurnPreviewSrc(turn);
  return (
    <div
      style={{ width: `${sliderWidth}px` }}
      className="dark:bg-dark-light bg-light flex flex-col rounded self-start h-auto"
      data-test-id={TID.lobbyTurn.modal}
    >
      <div className="bg-main-dark rounded-t p-4">
        {!!header && <h2 style={limitLine(2)}>{header}</h2>}
        {!!date && (
          <time className="block mt-1">{newDate.toLocaleDateString()}</time>
        )}
      </div>
      <div className="w-full h-auto">
        {!!previewSrc && (
          <TurnImage
            src={previewSrc}
            alt={`${header}`}
            wrapperClassName=""
            imgClassName="w-full h-auto object-contain object-center"
          />
        )}
      </div>
      <div className="h-auto overflow-auto p-4 dark:text-main-text text-dark-light">
        {!!text && <p>{text}</p>}
      </div>
      {/* переход от хода: холст откроется с вьюпортом на нём */}
      {!!game?.hash && (
        <div className="flex justify-end p-4 pt-0">
          <Button
            size="sm"
            onClick={() => window.location.assign(getGameUrl(game.hash, id))}
          >
            {t('Open_game')}
          </Button>
        </div>
      )}
      {/* {!!contentType && <p>{contentType}</p>} */}
    </div>
  );
};

export default TurnModal;
