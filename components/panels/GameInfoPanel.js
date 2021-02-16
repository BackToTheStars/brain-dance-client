// может быть, потом переделаем на Redux или Redux Saga
import { ROLES } from '../config';
import { useUiContext } from '../contexts/UI_Context';
import { useUserContext } from '../contexts/UserContext';
import AccessCodesTable from '../widgets/AccessCodeTable';
import useGamePlayerCode from '../hooks/edit-game-code';

const getUrl = ({ hash }) => {
  return typeof window === 'undefined' // SSR
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/game?hash=${hash}`
    : window.location.href;
};

const GameInfoPanel = ({ game }) => {
  const { gameInfoPanelIsHidden } = useUiContext();
  const { info, can, token } = useUserContext();
  const { code, addCode } = useGamePlayerCode(token);

  const { role, nickname } = info;

  if (!game) return 'Loading...';
  console.log({ game });

  const { name, description, image, public: publicStatus, codes = [] } = game;

  return (
    <div
      className={['p0', gameInfoPanelIsHidden ? 'hidden' : ''].join(' ')}
      id="gameInfoPanel"
    >
      <div>Игра: {name} (@todo карандаш)</div>
      <div>
        Ссылка для зрителей: <a href={getUrl(info)}>{getUrl(info)}</a>
      </div>
      <div>
        <p>Описание игры: {description}</p>
        <img src={image} />
        <p>{publicStatus ? 'This game is public' : 'This game is private'}</p>
      </div>
      <div>
        Инвайты на админа и игроков
        <AccessCodesTable codes={codes} />
        <button onClick={() => addCode(game)} className="btn btn-success">
          Get edit code
        </button>
        {!!code && <span>{code}</span>}
      </div>

      <div>
        <p>Your nickname: {nickname}</p>
        <p>Your role: {ROLES[role].name}</p>
      </div>
    </div>
  );
};

export default GameInfoPanel;
