import Game from '../src/game';
import { useEffect } from 'react';
import ButtonsPanel from './panels/ButtonsPanel';
import ClassesPanel from './panels/ClassesPanel';

const GameComponent = () => {
  useEffect(() => {
    const game = new Game({
      stageEl: $('#gameBox'),
    });
    game.init();
  }, []);

  return (
    <div style={{ width: '100%', display: 'flex' }}>
      <ClassesPanel />
      <div className="col p0">
        <div className="gameFieldWrapper">
          <div id="gameBox" className="ui-widget-content" />
        </div>

        <ButtonsPanel />

        <div id="notificationPanel" />

        <div className="quotes-panel" />

        {/* <div id="minimap"></div> */}
      </div>
    </div>
  );
};

export default GameComponent;
