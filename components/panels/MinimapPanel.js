import { useUiContext } from '../contexts/UI_Context';
import { useUserContext } from '../contexts/UserContext';
import { API_URL } from '../../src/config';
import { useState, useEffect } from 'react';

const styles = {
  panel: {
    zIndex: '1',
    height: 'auto',
    border: '2px solid #eee',
    backgroundColor: '#595959',
  },
  img: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
  },
  viewportArea: {
    position: 'absolute',
  },
};

const getField = (left, top, bottom, right) => {
  return [
    right - left, // field width
    bottom - top, // field height
    -left, // viewport x
    -top, // viewport y
  ];
};

function MinimapPanel(props) {
  const [prevData, setPrevData] = useState({ prevX: 0, prevY: 0 });
  const [timeCode, setTimeCode] = useState(new Date().getTime());
  const { minimapState, minimapDispatch } = useUiContext();
  const { info: { hash } = {} } = useUserContext();

  const {
    initLeft,
    initTop,
    initBottom,
    initRight,
    left,
    top,
    bottom,
    right,
  } = minimapState;

  // console.log({
  //   top: top - initTop,
  //   left: left - initLeft,
  //   bottom: bottom - initBottom,
  //   right: right - initRight,
  // });

  const mapWidth = 500; // ширина миникарты на экране

  console.log({
    initLeft,
    initTop,
    initBottom,
    initRight,
    left,
    top,
    bottom,
    right,
  });

  const deltaLeft = initLeft - left; // насколько мы сместились
  const deltaTop = initTop - top;

  const screenWidth = typeof window === 'undefined' ? 1920 : window.innerWidth;
  const screenHeight = typeof window === 'undefined' ? 800 : window.innerHeight;

  const [fieldWidth, fieldHeight, viewportX, viewportY] = getField(
    left,
    top,
    bottom,
    right
  );

  const width = screenWidth + fieldWidth;
  const height = screenHeight + fieldHeight;

  const mapHeight = Math.floor((mapWidth * height) / width);

  const imgWidth = Math.floor(((right - left) * 100) / width);
  const imgHeight = Math.floor(((bottom - top) * 100) / height);

  const imgViewportLeft = Math.floor(
    ((-initLeft + deltaLeft + screenWidth / 2) * 100) / width
  ); // отображаем прямоугольник на миникарте
  const imgViewportTop = Math.floor(
    ((-initTop + deltaTop + screenHeight / 2) * 100) / height
  );
  const imgViewportWidth = Math.floor((screenWidth * 100) / width);
  const imgViewportHeight = Math.floor((screenHeight * 100) / height);

  const refreshButtonClicked = () => {
    setTimeCode(new Date().getTime());
  };

  // console.log({
  //   width,
  //   height,

  //   mapWidth,
  //   mapHeight,

  //   imgViewportWidth,
  //   imgViewportHeight,
  // });

  // useEffect(() => {
  //   if (!!initLeft || !!initTop) {
  //     console.log({ initLeft });
  //     minimapDispatch({
  //       type: 'VIEWPORT_MOVED_ON_FIELD',
  //       payload: {
  //         // left: initLeft,
  //         // top: initTop,
  //       },
  //     });
  //   }
  // }, [initLeft, initTop]);

  return (
    <>
      {minimapState.isHidden ? (
        ''
      ) : (
        <div
          className="minimap-panel"
          style={{
            ...styles.panel,
            width: `${mapWidth}px`,
            height: `${mapHeight}px`,
          }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();

            if (e.target.classList.contains('minimap-panel__refresh-btn')) {
              return;
            }
            console.log(`rect: ${JSON.stringify(rect)}`);
            // const k = Math.floor(width / mapWidth);
            const xPerc = Math.floor(
              ((e.clientX - rect.left) * 100) / rect.width
            );
            const yPerc = Math.floor(
              ((e.clientY - rect.top) * 100) / rect.height
            );
            console.log(`Percentage: ${JSON.stringify({ xPerc, yPerc })}`);
            const { prevX, prevY } = prevData;
            const deltaX =
              Math.floor((width * xPerc) / 100) -
              window.innerWidth -
              prevX +
              initLeft;
            const deltaY =
              Math.floor((height * yPerc) / 100) -
              window.innerHeight -
              prevY +
              initTop;
            console.log(`delta: ${JSON.stringify({ deltaX, deltaY })}`);
            setPrevData({ prevX: deltaX + prevX, prevY: deltaY + prevY });
            console.log(`minimapState: ${JSON.stringify(minimapState)}`);

            const gameBox = document
              .querySelector('#gameBox')
              .getBoundingClientRect();

            // @fixme
            const gf = window[Symbol.for('MyGame')].gameField;
            gf.stageEl.css('left', `${-deltaX}px`);
            gf.stageEl.css('top', `${-deltaY}px`);
            gf.saveFieldSettings({
              left,
              top,
              height: 1000,
              width: 1000,
            });
            gf.triggers.dispatch('RECALCULATE_FIELD');
            gf.triggers.dispatch('DRAW_LINES');

            // const k = (2 * window.innerWidth) / 100;
            // const imgWidth = Math.floor((window.innerWidth * 17) / 100);
            // const xPerc = Math.floor(
            //   ((window.innerWidth - e.clientX) * 100) / imgWidth
            // );
            // const imgHeight = Math.floor((window.innerHeight * 17) / 100);
            // const yPerc = Math.floor(
            //   ((window.innerHeight - e.clientY) * 100) / imgHeight
            // );

            // console.log(100 - xPerc);
            // console.log(100 - yPerc);

            // console.log(e);
            // console.log(e.target.offsetLeft);
            // console.log(e.clientX);
            // console.log(e.target.offsetTop);
            // console.log(e.clientY);
          }}
        >
          <button
            className="minimap-panel__refresh-btn"
            onClick={refreshButtonClicked}
          >
            Refresh
          </button>
          <div
            style={{
              border: '2px solid white',
              ...styles.img,
              width: `${imgWidth}%`,
              height: `${imgHeight}%`,
              zIndex: 1,
            }}
          ></div>
          <img
            src={`${API_URL}/games/screenshot?hash=${hash}&timecode=${timeCode}`}
            // src={`${API_URL}/${hash}/output.png`}
            style={{
              ...styles.img,
              width: `${imgWidth}%`,
              height: `${imgHeight}%`,
            }}
          />
          <img
            style={{
              ...styles.viewportArea,
              left: `${imgViewportLeft}%`,
              top: `${imgViewportTop}%`,
              width: `${imgViewportWidth}%`,
              height: `${imgViewportHeight}%`,
            }}
            src="/img/viewport.png"
          />
        </div>
      )}
    </>
  );
}

export default MinimapPanel;