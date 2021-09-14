const PREV_FRONT_URL = 'http://localhost:3000';
const GameTable = ({ games, onItemClick }) => {
  // for(let game of games) {
  //   const gameEl = document.createElement('li');
  //   gameEl.innerHTML = `<a href="/?hash=${game.hash}">${game.name}</a>`;
  //   gamesList.appendChild(gameEl);
  // }

  return (
    <table className="table table-striped games-list">
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
              className="games-list__item"
              key={el.hash}
              onClick={(e) => {
                // e.preventDefault(); // не даёт нажать на # и улететь наверх страницы
                onItemClick(el.hash);
              }}
            >
              <td>{el.name}</td>
              <td className="text-center">{el.turnsCount - 1}</td>
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
