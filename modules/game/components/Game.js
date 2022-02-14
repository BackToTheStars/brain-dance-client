import { loadFullGame } from "@/modules/game/game-redux/actions";
import Turns from "@/modules/turns/components/Turns";
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";

const Game = ({ hash }) => {
  const gameBox = useRef();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadFullGame(hash));
    // loadClasses();
  }, []); // token

  return (
    <div className="react-wrapper">
      <div className="gameFieldWrapper">
        <div
          id="gameBox"
          className="ui-widget-content"
          ref={gameBox}
          // onDoubleClick={(e) => setSvgLayerZIndex(!svgLayerZIndex)}
        >
          <Turns />
        </div>
        {/* PANELS */}
      </div>
    </div>
  )
}

export default Game