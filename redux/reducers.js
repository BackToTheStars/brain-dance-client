import { gameReducer } from '@/modules/game/game-redux/reducers'
import { gamesReducer } from '@/modules/game/games-redux/reducers'
import { linesReducer } from '@/modules/lines/redux/reducers'
import { turnsReducer } from '@/modules/turns/redux/reducers'
import { combineReducers } from 'redux'

// COMBINED REDUCERS
const reducers = {
  games: gamesReducer,
  game: gameReducer,
  turns: turnsReducer,
  lines: linesReducer,
  // quotes,
  // panels,
  // interactions,
  // minimap,
  // classes,
}

export default combineReducers(reducers)