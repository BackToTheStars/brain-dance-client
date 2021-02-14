// может быть, потом переделаем на Redux или Redux Saga

import { useUiContext } from '../contexts/UI_Context';

const GameInfoPanel = () => {
  const { gameInfoPanelIsHidden } = useUiContext();
  console.log({ gameInfoPanelIsHidden });
  return (
    <div
      className={['p0', gameInfoPanelIsHidden ? 'hidden' : ''].join(' ')}
      id="gameInfoPanel"
    >
      <div>Название (+ карандаш)</div>
      <div>Ссылка</div>
      <div>Другие поля</div>
      <div>Инвайты</div>
      <div>Профиль текущего пользователя</div>
    </div>
  );
};

export default GameInfoPanel;
