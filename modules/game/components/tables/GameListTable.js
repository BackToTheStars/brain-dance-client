import { useAdminContext } from '@/modules/admin/contexts/AdminContext';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loadGames, setActiveGameByHash } from '../../games-redux/actions';

const GameListTable = () => {
  const { adminUser } = useAdminContext();
  const { games, activeGame } = useSelector((state) => state.games);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!adminUser.loaded) return;
    dispatch(loadGames());
  }, [adminUser.loaded]);

  const [filter, setFilter] = useState('');

  const filteredGames = filter
    ? games.filter(
        (game) => game.name.toLowerCase().indexOf(filter.toLowerCase()) !== -1
      )
    : games;

  return (
    <table className="table table-striped mt-3 table-games main-table">
      <thead>
        <tr style={{ boxShadow: '0 -1px 0 #aaa inset' }}>
          <th>
            <div className="row">
              <label className="col-auto col-form-label">Name</label>
              <div className="col">
                <input
                  onChange={(e) => setFilter(e.target.value)}
                  value={filter}
                  className="form-control"
                  type="text"
                  placeholder="Search"
                />
              </div>
            </div>
          </th>
          <th className="text-center d-none d-md-table-cell">
            <label className="col-form-label">Turns</label>
          </th>
          <th className="text-center d-none d-md-table-cell">
            <label className="col-form-label">Visibility</label>
          </th>
        </tr>
      </thead>
      <tbody>
        {filteredGames.map((el) => {
          return (
            <tr
              className={`item ${
                activeGame?.hash === el.hash ? 'table-primary' : ''
              }`}
              key={el.hash}
              onClick={() => dispatch(setActiveGameByHash(el.hash))}
            >
              <td>{el.name}</td>
              <td className="text-center d-none d-md-table-cell">
                {el.turnsCount}
              </td>
              <td className="text-center d-none d-md-table-cell">
                {el.public ? 'Public' : 'Private'}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default GameListTable;
