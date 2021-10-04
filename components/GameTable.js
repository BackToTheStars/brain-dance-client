const PREV_FRONT_URL = 'http://localhost:3000';
const GameTable = ({ games, onItemClick, gameClicked }) => {
  // for(let game of games) {
  //   const gameEl = document.createElement('li');
  //   gameEl.innerHTML = `<a href="/?hash=${game.hash}">${game.name}</a>`;
  //   gamesList.appendChild(gameEl);
  // }
  // console.log({ games, gameClicked });

  return (
    <table className="table table-striped games-list mt-3">
      <thead>
        <tr className="games-list__header">
          <th>Name</th>
          <th className="text-center games-list__turns-count">Turns</th>
          <th className="text-center games-list__visibility">Visibility</th>
        </tr>
      </thead>
      <tbody>
        {games.map((el) => {
          return (
            <tr
              className={`games-list__item ${
                !!gameClicked && gameClicked.hash === el.hash
                  ? 'table-primary'
                  : ''
              }`}
              key={el.hash}
              onClick={(e) => {
                // e.preventDefault(); // не даёт нажать на # и улететь наверх страницы
                onItemClick(el.hash);
              }}
            >
              <td>{el.name}</td>
              <td className="text-center">{el.turnsCount}</td>
              <td className="text-center">
                {el.public ? 'Public' : 'Private'}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default GameTable;
