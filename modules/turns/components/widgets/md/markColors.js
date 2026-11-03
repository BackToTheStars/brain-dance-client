// CSS-переменные цветов выделения для контейнера статьи: фон по букве и цвет текста по
// яркости фона — как у цитат абзаца (modifyQuoteBackgrounds). Буквы перечислены ещё и в
// turn.scss (mark[data-color]); значения живут только здесь.

import { getNeedBlackText, rgbToHex } from '../../helpers/color';
import { MD_COLORS } from './markdown';

export const MARK_COLOR_VARS = Object.fromEntries(
  Object.entries(MD_COLORS).flatMap(([letter, rgb]) => [
    [`--md-mark-${letter}`, rgb],
    [`--md-mark-${letter}-text`, getNeedBlackText(rgbToHex(rgb)) ? '#000' : '#fff'],
  ]),
);
