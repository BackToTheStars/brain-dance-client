import { useSelector } from 'react-redux';
import { memo, useMemo } from 'react';
import { TURN_BORDER_THICKNESS } from '@/config/ui';
import Line from './Line';

const getCoordsByTurnPositionAndMarkerQuote = ( turnPosition, markerQuote ) => {
  if (!turnPosition) return null;
  if (!markerQuote)
    return {
      left: turnPosition.x,
      top: turnPosition.y,
      width: 10,
      height: 10,
    };
  return {
    left:
      turnPosition.x +
      markerQuote.left +
      (markerQuote.type === 'text' ? TURN_BORDER_THICKNESS : 0),
    top:
      turnPosition.y +
      markerQuote.top +
      (markerQuote.type === 'text' ? TURN_BORDER_THICKNESS : 0),
    width: markerQuote.width,
    height: markerQuote.height,
  };
}

const LogicLine = ({ line }) => {
  const { _id, sourceTurnId, sourceMarker, targetTurnId, targetMarker } = line;
  const sourceTurnPosition = useSelector(
    (state) => state.turns.d[sourceTurnId]?.position
  );
  const targetTurnPosition = useSelector(
    (state) => state.turns.d[targetTurnId]?.position
  );
  const gamePosition = useSelector((state) => state.game.position);
  const viewport = useSelector((state) => state.ui.viewport);
  // const quotesInfo = useSelector((state) => state.lines.quotesInfo);
  // // const d = useSelector((state) => state.turns.d);
  // // const sourceMarkerQuote = quotesInfo[`${sourceTurnId}_${sourceMarker}`];
  const sourceMarkerQuote = useSelector((state) =>
    state.lines.quotesInfo[sourceTurnId]?.find(
      (q) => +q.quoteId === sourceMarker
    )
  );
  const targetMarkerQuote = useSelector((state) =>
    state.lines.quotesInfo[targetTurnId]?.find(
      (q) => +q.quoteId === targetMarker
    )
  );

  const sourceCoords = useMemo(() => {
    return getCoordsByTurnPositionAndMarkerQuote(sourceTurnPosition, sourceMarkerQuote);
  }, [sourceTurnPosition, sourceMarkerQuote]);

  const targetCoords = useMemo(() => {
    return getCoordsByTurnPositionAndMarkerQuote(targetTurnPosition, targetMarkerQuote);
  }, [targetTurnPosition, targetMarkerQuote]);

  const { prevSleft, prevSTop } = useMemo(() => {
    return {
      prevSleft: sourceCoords?.left - gamePosition.x + viewport.width,
      prevSTop: sourceCoords?.top - gamePosition.y + viewport.height,
    };
  }, [sourceCoords, gamePosition, viewport]);

  const { prevTLeft, prevTTop } = useMemo(() => {
    return {
      prevTLeft: targetCoords?.left - gamePosition.x + viewport.width,
      prevTTop: targetCoords?.top - gamePosition.y + viewport.height,
    };
  }, [targetCoords, gamePosition, viewport]);

  if (!sourceCoords || !targetCoords) {
    return null;
  }

  return <Line
    prevSWidth={sourceCoords.width}
    prevSHeight={sourceCoords.height}
    prevSLeft={prevSleft}
    prevSTop={prevSTop}
    prevTWidth={targetCoords.width}
    prevTHeight={targetCoords.height}
    prevTLeft={prevTLeft}
    prevTTop={prevTTop}
  />
};

export default memo(LogicLine);
