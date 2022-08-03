import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadLastGamesTurns } from '../../games-redux/actions';

const LastTurns = () => {
  const lastTurns = useSelector((store) => store.games.lastTurns);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadLastGamesTurns());
  }, []);

  return (
    <div className="last-turns">
      {lastTurns
        .filter((turn) => turn.contentType !== 'text')
        .filter((turn) => turn.contentType !== 'comment')
        .map((turn) => {
          return (
            <div className="top-4" key={turn._id}>
              <br></br>

              <div className="card">
                {/*<img
                  className="card-img-top d-none d-sm-block"
                  src={(() => {
                    switch (turn.contentType) {
                      case 'picture':
                        return turn.imageUrl
                          ? turn.imageUrl
                          : 'img/game_screenshot.png';
                      case 'video':
                        return turn.videoUrl
                          ? turn.videoUrl
                          : 'img/game_screenshot.png';
                      default:
                        return 'img/game_screenshot.png';
                    }
                  })()}
                  alt="Game image"
                />*/}

                {turn.contentType == 'picture' &&
                  (turn.imageUrl ? (
                    <img
                      className="card-img-top d-none d-sm-block"
                      src={turn.imageUrl}
                      alt="Game image"
                    />
                  ) : (
                    <img
                      className="card-img-top d-none d-sm-block"
                      src="img/game_screenshot.png"
                      alt="Game image"
                    />
                  ))}

                {!!turn.videoUrl && (
                  <iframe
                    className="card-img-top d-none d-sm-block"
                    src={turn.videoUrl.replace('watch?v=', 'embed/')}
                    frameborder="1"
                    allowfullscreen
                  ></iframe>
                )}

                <div className="card-body">
                  <h5 className="card-title">{turn.header}</h5>
                  <div className="card-game-buttons">
                    <a
                      className="btn btn-success me-2 mb-2"
                      href={'game?hash=' + turn.gameId}
                    >
                      Open
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      <br></br>
    </div>
  );
};

export default LastTurns;
