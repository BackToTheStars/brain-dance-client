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
    zeroX,
    zeroY,
    initZeroX,
    initZeroY,
  } = minimapState;

  // console.log({
  //   top: top - initTop,
  //   left: left - initLeft,
  //   bottom: bottom - initBottom,
  //   right: right - initRight,
  // });

  const mapWidth = 500; // ширина миникарты на экране

  // console.log({
  // initLeft,
  // initTop,
  // initBottom,
  // initRight,
  // left,
  // top,
  // bottom,
  // right,
  //   zeroX,
  //   zeroY,
  //   initZeroX,
  //   initZeroY,
  // });

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
  // console.log({ viewportX, viewportY });

  const width = screenWidth + fieldWidth;
  const height = screenHeight + fieldHeight;

  const mapHeight = Math.floor((mapWidth * height) / width);

  const imgWidth = Math.floor(((right - left) * 100) / width);
  const imgHeight = Math.floor(((bottom - top) * 100) / height);
  // console.log({ width, height });

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

  // console.log(`Сдвиг влево: ${zeroX - initZeroX}`);
  // console.log(
  //   `Изменение ширины поля: ${right - left - (initRight - initLeft)}`
  // );
  // console.log(`Изменение левой стороны поля: ${left - initLeft}`);
  // console.log(
  //   `Дополнительные px слева: ${left - initLeft - (zeroX - initZeroX)}`
  // );
  // console.log(`Изменение правой стороны поля: ${right - initRight}`);
  // console.log(
  //   `Дополнительные px справа: ${right - initRight - (zeroX - initZeroX)}`
  // );

  const extraPercLeft =
    ((zeroX - initZeroX - (left - initLeft)) * 100) / fieldWidth;
  const extraPercRight =
    ((zeroX - initZeroX - (right - initRight)) * 100) / fieldWidth;
  const extraPercTop =
    ((zeroY - initZeroY - (top - initTop)) * 100) / fieldHeight;
  const extraPercBottom =
    ((zeroY - initZeroY - (bottom - initBottom)) * 100) / fieldHeight;

  // console.log({
  // extraLeft: zeroX - initZeroX - (left - initLeft),
  // extraRight: zeroX - initZeroX - (right - initRight),
  // fieldWidth,
  //   extraPercTop,
  //   extraPercBottom,
  //   fieldHeight,
  // });

  // если extraRight < 0, то справа нужно добавить свободную область

  // если extraRight > 0, то поле уменьшилось, скриншот нужно расширить
  const percImgWidth = 100 - extraPercLeft + extraPercRight;
  const percImgHieght = 100 - extraPercTop + extraPercBottom;

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
            // console.log(`rect: ${JSON.stringify(rect)}`);
            // const k = Math.floor(width / mapWidth);
            const xPerc = Math.floor(
              ((e.clientX - rect.left) * 100) / rect.width
            );
            const yPerc = Math.floor(
              ((e.clientY - rect.top) * 100) / rect.height
            );

            console.log(`Percentage: ${JSON.stringify({ xPerc, yPerc })}`);

            console.log(`Shift: ${initZeroX - zeroX} ${initZeroY - zeroY}`);

            // текущее расположение центра внутри MiniMap в процентах
            const leftScreenshotPosition = Math.floor(window.innerWidth / 2); // первоначально
            const topScreenshotPosition = Math.floor(window.innerHeight / 2);
            console.log(`Coords Zero Point in Minimap (px): `, {
              x: leftScreenshotPosition + initZeroX,
              // initZeroX,
              y: topScreenshotPosition + initZeroY,
              // initZeroY,
            });

            const pxRealToPxMinimap = Math.floor(window.innerWidth / 2) / 100; // при изменении скриншота нужно учесть extraPercLeft
            // const pxRealToPxMimimapY =
            console.log(
              `Zero x initialy placed in Minimap on X(px): `,
              (leftScreenshotPosition + initZeroX) / pxRealToPxMinimap
            );
            const zeroXInitPerc =
              (((leftScreenshotPosition + initZeroX) / pxRealToPxMinimap) *
                100) /
              500;
            const zeroYInitPerc =
              (((topScreenshotPosition + initZeroY) / pxRealToPxMinimap) *
                100) /
              500;
            console.log(
              `Zero x initialy placed in Minimap on X(%): `,
              zeroXInitPerc
            );

            console.log(
              `Zero x now placed in Minimap on X(px): `,
              (leftScreenshotPosition + zeroX) / pxRealToPxMinimap
            );

            console.log(
              'Need to shift X (%) from zero position',
              xPerc - zeroXInitPerc
            );

            console.log(
              `Need to place the field X (px)`,
              initZeroX + (xPerc - zeroXInitPerc) * 5 * pxRealToPxMinimap
            );
            const newFieldLeft = Math.floor(
              initZeroX + (xPerc - zeroXInitPerc) * 5 * pxRealToPxMinimap
            );
            const newFieldTop = Math.floor(
              initZeroX + (yPerc - zeroYInitPerc) * 5 * pxRealToPxMinimap
            );
            console.log({ newFieldLeft });

            // return;
            const { prevX, prevY } = prevData;
            console.log(`zeroX initZeroX;`, zeroX, initZeroX);
            const deltaX =
              Math.floor((width * xPerc) / 100) -
              window.innerWidth -
              // zeroX +
              // initZeroX;
              prevX +
              initLeft;
            const deltaY =
              Math.floor((height * yPerc) / 100) -
              window.innerHeight -
              // zeroY +
              // initZeroY;
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
            // gf.stageEl.css('left', `${-deltaX}px`);
            gf.stageEl.css(
              'left',
              `${
                -newFieldLeft +
                (initZeroX - zeroX) +
                Math.floor(window.innerWidth / 2)
              }px`
            );
            // gf.stageEl.css('top', `${-deltaY}px`);
            gf.stageEl.css(
              'top',
              `${
                -newFieldTop +
                (initZeroY - zeroY) +
                Math.floor(window.innerHeight / 2)
              }px`
            );

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
              // paddingLeft: `${extraPercLeft}%`, // можно сделать увеличение в px
              // paddingRight: `${extraPercRight}%`,
              //              paddingTop: `${viewportY > 0 ? '0' : viewportY / 10}px`,
              zIndex: 1,
            }}
          >
            <img
              src={`${API_URL}/games/screenshot?hash=${hash}&timecode=${timeCode}`}
              // src={`${API_URL}/${hash}/output.png`}
              style={{
                position: 'absolute',
                // ...styles.img,
                left: `${extraPercLeft}%`,
                top: `${extraPercTop}%`,
                width: `${percImgWidth}%`,
                // width: `${imgWidth}%`,
                // height: `${imgHeight}%`,
              }}
            />
          </div>

          <img
            style={{
              ...styles.viewportArea,
              left: `${imgViewportLeft}%`,
              top: `${imgViewportTop}%`,
              width: `${imgViewportWidth}%`,
              height: `${imgViewportHeight}%`,
              zIndex: 1,
            }}
            src="/img/viewport.png"
          />
        </div>
      )}
    </>
  );
}

export default MinimapPanel;
