// может быть, потом переделаем на Redux или Redux Saga
import { ROLES } from '../config';
import { useUiContext } from '../contexts/UI_Context';
import { useUserContext } from '../contexts/UserContext';

const GameInfoPanel = ({ game }) => {
  const { gameInfoPanelIsHidden } = useUiContext();
  const { info, can } = useUserContext();
  console.log({ info });
  const { role, nickname } = info;
  return (
    <div
      className={['p0', gameInfoPanelIsHidden ? 'hidden' : ''].join(' ')}
      id="gameInfoPanel"
    >
      {!!game && <div>{game.name} (+ карандаш)</div>}
      <div>Ссылка</div>
      <div>Другие поля, редактирование полей</div>
      <div>Инвайты на админа и игроков</div>

      <div>
        <p>Name: {nickname}</p>
        <p>Role: {ROLES[role].name}</p>
      </div>
    </div>
  );
};

export default GameInfoPanel;
