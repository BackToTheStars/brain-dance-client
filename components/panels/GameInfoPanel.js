// может быть, потом переделаем на Redux или Redux Saga
import { ROLES, RULE_GAME_EDIT } from '../config';
import { useUiContext } from '../contexts/UI_Context';
import { UserContext, useUserContext } from '../contexts/UserContext';
import AccessCodesTable from '../widgets/AccessCodeTable';
import useGamePlayerCode from '../hooks/edit-game-code';

const getUrl = ({ hash }) => {
  return typeof window === 'undefined' // SSR
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/game?hash=${hash}`
    : window.location.href;
};

const GameInfoPanel = ({ game }) => {
  const { gameInfoPanelIsHidden, setGameInfoPanelIsHidden } = useUiContext();
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
      <table class="table game-info-table">
        <tbody>
          <tr>
            <td>Game name:</td>
            <td>
              <h4>{name}</h4>
            </td>{' '}
            {/* @todo карандаш */}
          </tr>
          <tr>
            <td></td>
            <td>
              {publicStatus ? 'This game is public' : 'This game is private'}
            </td>
          </tr>
          <tr>
            <td>Visitor link:</td>
            <td>
              <a href={getUrl(info)}>{getUrl(info)}</a>
            </td>
          </tr>
          <tr>
            <td>Game description:</td>
            <td>{description}</td>
          </tr>
          {/* <tr>
            <td></td>
            <td>
              <img src={image} />
            </td>
          </tr> */}
          {can(RULE_GAME_EDIT) && (
            <tr>
              <td>
                <p>Invite admin / player</p>
                <a
                  href="#"
                  onClick={() => addCode(game)}
                  className="btn btn-success"
                >
                  Get player code
                </a>
              </td>
              <td>
                {!!code && <span>{code}</span>}
                <AccessCodesTable codes={codes} />
              </td>
            </tr>
          )}
          <tr>
            <td>Your nickname:</td>
            <td>{nickname}</td>
          </tr>
          <tr>
            <td>Your role:</td>
            <td>
              <h4>{ROLES[role].name}</h4>
            </td>
          </tr>
        </tbody>
      </table>
      <a
        href="#"
        onClick={() => setGameInfoPanelIsHidden(true)}
        class="btn btn-secondary ml-12px"
      >
        Close
      </a>
    </div>
  );
};

export default GameInfoPanel;
