import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { linesWithEndCoordsUpdate } from '../redux/actions';
import { getLineEnds, getLinesCoords } from './helpers/line';

const LinesCalculator = () => {
  const lines = useSelector((store) => store.lines.lines);
  // const linesWithEndCoords = useSelector(
  //   (store) => store.lines.linesWithEndCoords
  // );
  const quotesInfo = useSelector((store) => store.lines.quotesInfo);
  const turnsDictionary = useSelector((store) => store.turns.d);
  const gamePosition = useSelector((store) => store.game.position);
  const dispatch = useDispatch();

  const turnsToRender = Object.keys(turnsDictionary);

  // const pictureQuotesInfo = {};
  useEffect(() => {
    const linesWithEndCoordsNew = getLinesCoords(
      lines,
      turnsToRender,
      turnsDictionary,
      quotesInfo
      // pictureQuotesInfo
    );

    // if (!linesWithEndCoordsNew.length && !linesWithEndCoords.length) return;

    dispatch(linesWithEndCoordsUpdate(linesWithEndCoordsNew));
    // turnsDispatch({
    //   type: ACTION_RECALCULATE_LINES,
    //   payload: linesWithEndCoords,
    // });
    // turnsDispatch({
    //   type: ACTION_UPDATE_LINE_ENDS,
    //   payload: getLineEnds(linesWithEndCoords),
    // });
  }, [lines, turnsToRender, quotesInfo, gamePosition]);
  return '';
};

export default LinesCalculator;
