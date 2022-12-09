import {
  COMP_ACTIVE,
  NOT_EXISTS,
  ORIG_ACTIVE,
} from '../widgets/paragraph/settings';
import { checkIfParagraphExists } from './quillHelper';

export const getParagraphStage = (turn) => {
  if (!!turn.paragraphStage) return turn.paragraphStage;
  if (!!turn.pictureOnly || !checkIfParagraphExists(turn.paragraph)) {
    return NOT_EXISTS;
  }

  if (turn.compressed) return COMP_ACTIVE;
  return ORIG_ACTIVE;
};
