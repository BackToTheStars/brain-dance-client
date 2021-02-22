import Link from 'next/link'; // линк для роутера next.js, асинхнонно грузит и кеширует разметку
import AccessCodesTable from './widgets/AccessCodeTable';
// https://via.placeholder.com/400x300

// const PREV_FRONT_URL = 'http://localhost:3000'
const GameDetails = ({
  game,
  mode,
  deleteGame,
  openEditGameForm,
  addCode,
  code,
}) => {
  if (!game) {
    return null;
  }

  const { codes = [] } = game;

  return (
    <div className="card">
      {!!game.image ? (
        <img className="card-img-top" src={game.image} alt="Card image cap" />
      ) : (
        <img
          className="card-img-top"
          src="/img/game_screenshot.png"
          alt="Card image cap"
        />
      )}
      <div className="card-body">
        <h5 className="card-title">{game.name}</h5>
        {!!game.description && <p className="card-text">{game.description}</p>}

        <div className="card-game-buttons">
          {/* <Link href={`/game?hash=${game.hash}`}> */}
          <a href={`/game?hash=${game.hash}`} className="btn btn-success">
            Open
          </a>
          {/* </Link> */}
          {mode === 'admin' && (
            <>
              <button
                className="btn btn-primary"
                onClick={() => openEditGameForm(game)}
              >
                Edit
              </button>
              <button
                className="btn btn-danger"
                onClick={() => deleteGame(game)}
              >
                Delete Game
              </button>
              <hr />
              {!!codes.length && <AccessCodesTable codes={codes} />}
              <button onClick={() => addCode(game)} className="btn btn-success">
                Get edit code
              </button>
              {!!code && <span>{code}</span>}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameDetails;
