import { classesReducer } from '@/modules/classes/redux/reducers';
import { gameReducer } from '@/modules/game/game-redux/reducers';
import { gamesReducer } from '@/modules/game/games-redux/reducers';
import { linesReducer } from '@/modules/lines/redux/reducers';
import { panelReducer } from '@/modules/panels/redux/reducers';
import { quoteReducer } from '@/modules/quotes/redux/reducers';
import { turnsReducer } from '@/modules/turns/redux/reducers';
import { UIReducer } from '@/modules/ui/redux/reducers';
import { combineReducers } from 'redux';
import { lobbyReducer } from '@/modules/lobby/redux/reducers';
import { settingsReducer } from '@/modules/settings/redux/reducers';
import languageReducer from '@/modules/settings/redux/lang/languageSlice';

// COMBINED REDUCERS
const reducers = {
  games: gamesReducer,
  game: gameReducer,
  turns: turnsReducer,
  lines: linesReducer,
  classes: classesReducer,
  panels: panelReducer,
  ui: UIReducer,
  quotes: quoteReducer,
  // interactions,
  // minimap,
  lobby: lobbyReducer,
  settings: settingsReducer,
  lang: languageReducer,
};

export default combineReducers(reducers);
