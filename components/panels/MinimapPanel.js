import { useUiContext } from '../contexts/UI_Context';
import { API_URL } from '../../src/config';
import { useRef } from 'react';

const styles = {
  panel: {
    zIndex: '1',
    height: 'auto',
    border: '2px solid #eee',
  },
  img: {
    width: '100%',
  },
};

function MinimapPanel(props) {
  const { minimapState, minimapDispatch } = useUiContext();
  const imgRef = useRef();

  return (
    <>
      {minimapState.isHidden ? (
        ''
      ) : (
        <div className="minimap-panel" style={styles.panel}>
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
            ref={imgRef}
            src={`${API_URL}/output.png`}
            style={styles.img}
          />
        </div>
      )}
    </>
  );
}

export default MinimapPanel;
