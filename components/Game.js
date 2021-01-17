import Game from '../src/game';
import { useEffect } from 'react';

const GameComponent = () => {
  useEffect(() => {
    const game = new Game({
      stageEl: $('#gameBox'),
    });
    game.init();
  }, []);

  return (
    <div style={{ width: '100%', display: 'flex' }}>
      <div className="p0 hidden" id="classMenu" />
      <div className="col p0">
        <div className="gameFieldWrapper">
          <div id="gameBox" className="ui-widget-content" />
        </div>

        <div className="actions">
          <button id="add-new-box-to-game-btn">Add Turn</button>
          <button id="save-positions-btn">Save Field</button>
          <button id="toggle-left-panel">Left Panel</button>
          {/* <button id="show-minimap-btn">Minimap</button> */}
          <button id="go-to-lobby">Lobby</button>
        </div>

        <div id="notificationPanel" />

        <div className="quotes-panel" />

        {/* <div id="minimap"></div> */}
      </div>
    </div>
  );
};

export default GameComponent;
