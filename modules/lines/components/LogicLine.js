import { useSelector } from 'react-redux';
import { memo, useMemo } from 'react';
import { TURN_BORDER_THICKNESS } from '@/config/ui';
import Line from './Line';

const getCoordsByTurnPositionAndMarkerQuote = (turnPosition, markerQuote) => {
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
};

const LogicLine = ({ id }) => {
  const line = useSelector((state) => state.lines.d[id]);
  const { sourceTurnId, sourceMarker, targetTurnId, targetMarker } = line;
  const sourceTurnPosition = useSelector(
    (state) => state.turns.g[sourceTurnId]?.position,
  );

  const targetTurnPosition = useSelector(
    (state) => state.turns.g[targetTurnId]?.position,
  );
  const gamePosition = useSelector((state) => state.game.position);
  const viewport = useSelector((state) => state.game.viewport);

  const sourceMarkerQuote = useSelector(
    (state) =>
      state.lines.quotesInfoByQuoteKey[`${sourceTurnId}_${sourceMarker}`],
  );

  const targetMarkerQuote = useSelector(
    (state) =>
      state.lines.quotesInfoByQuoteKey[`${targetTurnId}_${targetMarker}`],
  );

  const sourceCoords = useMemo(() => {
    return getCoordsByTurnPositionAndMarkerQuote(
      sourceTurnPosition,
      sourceMarkerQuote,
    );
  }, [sourceTurnPosition, sourceMarkerQuote]);

  const targetCoords = useMemo(() => {
    return getCoordsByTurnPositionAndMarkerQuote(
      targetTurnPosition,
      targetMarkerQuote,
    );
  }, [targetTurnPosition, targetMarkerQuote]);

  // @todo: нужен ли viewport?
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

  return (
    <Line
      prevSWidth={sourceCoords.width}
      prevSHeight={sourceCoords.height}
      prevSLeft={prevSleft}
      prevSTop={prevSTop}
      prevTWidth={targetCoords.width}
      prevTHeight={targetCoords.height}
      prevTLeft={prevTLeft}
      prevTTop={prevTTop}
    />
  );
};

export default memo(LogicLine);
