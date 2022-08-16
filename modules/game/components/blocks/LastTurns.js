import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadLastGamesTurns } from '../../games-redux/actions';
import { useMemo } from 'react';
import Link from 'next/link';

const LastTurns = () => {
  const lastTurns = useSelector((store) => store.games.lastTurns);
  const lastTurnsGamesDictionary = useSelector(
    (store) => store.games.lastTurnsGamesDictionary
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadLastGamesTurns());
  }, []);

  const filteredTurns = useMemo(() => {
    return lastTurns.filter(
      (turn) => !['text', 'comment'].includes(turn.contentType)
    );
  }, [lastTurns]);

  return (
    <div className="last-turns">
      {filteredTurns.map((turn) => {
        return (
          <div className="top-4" key={turn._id}>
            <br></br>

            <div className="card">
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
                  <Link
                    href={'game?hash=' + lastTurnsGamesDictionary[turn._id]}
                  >
                    <a className="btn btn-success me-2 mb-2">Open</a>
                  </Link>
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
