import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { linesWithEndCoordsUpdate } from '../redux/actions';
import { getLineEnds, getLinesCoords } from './helpers/line';

const LinesCalculator = () => {
  const lines = useSelector((state) => state.lines.lines);
  // const linesWithEndCoords = useSelector(
  //   (state) => state.lines.linesWithEndCoords
  // );
  const quotesInfo = useSelector((state) => state.lines.quotesInfo);
  const turnsDictionary = useSelector((state) => state.turns.d);
  const gamePosition = useSelector((state) => state.game.position);
  const viewport = useSelector((state) => state.ui.viewport);
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
  }, [lines, turnsToRender, quotesInfo, gamePosition, viewport]);
  return '';
};

export default LinesCalculator;
