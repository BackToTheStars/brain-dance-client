import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { linesWithEndCoordsUpdate } from "../redux/actions";
import { getLineEnds, getLinesCoords } from "./helpers/line";

const LinesCalculator = () => {
  // lines,
  // turns,
  // quotesInfo
  const lines = useSelector((store) => store.lines.lines)
  const quotesInfo = useSelector((store) => store.lines.quotesInfo)
  const turns = useSelector((store) => store.turns.turns)
  // const { lines } = useSelector((store) => store.lines.lines)
  const dispatch = useDispatch();

  const turnsToRender = turns.map(turn => turn._id);
  const pictureQuotesInfo = {}
  useEffect(() => {
    const linesWithEndCoords = getLinesCoords(
      lines,
      turns,
      turnsToRender,
      quotesInfo,
      pictureQuotesInfo
    );
    dispatch(linesWithEndCoordsUpdate(linesWithEndCoords))
    // turnsDispatch({
    //   type: ACTION_RECALCULATE_LINES,
    //   payload: linesWithEndCoords,
    // });
    // turnsDispatch({
    //   type: ACTION_UPDATE_LINE_ENDS,
    //   payload: getLineEnds(linesWithEndCoords),
    // });
  }, [
    lines,
    turns,
    turnsToRender,
    quotesInfo,
    pictureQuotesInfo
  ]);
  return ""
}

export default LinesCalculator