import { useUiContext } from '../contexts/UI_Context';
import { API_URL } from '../../src/config';

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

function MinimapPanel(props) {
  const { minimapState, minimapDispatch } = useUiContext();

  const { initLeft, initTop, left, top, bottom, right } = minimapState;

  console.log({
    initLeft,
    initTop,
    left,
    top,
    bottom,
    right,
  });

  const mapWidth = 500; // ширина миникарты на экране

  const deltaLeft = initLeft - left; // насколько мы сместились
  const deltaTop = initTop - top;

  const screenWidth = typeof window === 'undefined' ? 1920 : window.innerWidth;
  const screenHeight = typeof window === 'undefined' ? 800 : window.innerHeight;

  const width = screenWidth * 2 + right - left;
  const height = screenHeight * 2 + bottom - top;

  const mapHeight = Math.floor((mapWidth * height) / width);

  const imgWidth = Math.floor(((right - left) * 100) / width);
  const imgHeight = Math.floor(((bottom - top) * 100) / height);

  const imgViewportLeft = Math.floor(((deltaLeft + screenWidth) * 100) / width); // отображаем прямоугольник на миникарте
  const imgViewportTop = Math.floor(((deltaTop + screenHeight) * 100) / height);
  const imgViewportWidth = Math.floor((screenWidth * 100) / width);
  const imgViewportHeight = Math.floor((screenHeight * 100) / height);

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
        >
          <img
            onClick={(e) => {
              const rect = e.target.getBoundingClientRect();

              const xPerc = Math.floor(
                ((e.clientX - rect.left) * 100) / rect.width
              );

              const yPerc = Math.floor(
                ((e.clientY - rect.top) * 100) / rect.height
              );

              console.log({ xPerc, yPerc });

              const gameBox = document
                .querySelector('#gameBox')
                .getBoundingClientRect();

              console.log(gameBox.height, gameBox.width);

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
            src={`${API_URL}/output.png`}
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
