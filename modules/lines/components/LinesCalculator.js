import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { linesWithEndCoordsUpdate } from '../redux/actions';
import { getLineEnds, getLinesCoords } from './helpers/line';

const getSerializedTurnsGeometry = (d) => {
  return JSON.stringify(
    Object.keys(d).map(({ size, position }) => ({ size, position }))
  );
};

const LinesCalculator = () => {
  const lines = useSelector((state) => state.lines.lines);
  const quotesInfo = useSelector((state) => state.lines.quotesInfo);
  const turnsDictionary = useSelector((state) => state.turns.d);
  const [serializedTurnsGeometry, setSerializedTurnsGeometry] = useState(
    getSerializedTurnsGeometry(turnsDictionary)
  );
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

    if (turnsToRender.length !== 0) {
      dispatch(linesWithEndCoordsUpdate(linesWithEndCoordsNew));
    }
  }, [lines, quotesInfo, serializedTurnsGeometry]);
  
  useEffect(() => {
    setSerializedTurnsGeometry(getSerializedTurnsGeometry(turnsDictionary))
  }, [turnsDictionary])
  return '';
};

export default LinesCalculator;
