import { DEFAULT_GAME_IMG } from '@/config/ui';
import { USER_MODE_ADMIN } from '@/config/user';
import Link from 'next/link';
import { useState } from 'react';
import EditGameModal from '../modals/EditGameModal';
import { useSelector } from 'react-redux';
import { useAdminContext } from '@/modules/admin/contexts/AdminContext';
import { addCode, deleteGame } from '../../games-redux/actions';
import { useDispatch } from 'react-redux';
import AccessCodesTable from '../tables/AccessCodesTable';

const GameDetails = () => {
  const { adminUser } = useAdminContext();
  const [editGameData, setEditGameData] = useState(null);
  const { activeGame: game } = useSelector((state) => state.games);
  const dispatch = useDispatch();

  if (!game) {
    return null;
  }

  const { image, name, description, codes = [], hash, code } = game;

  return (
    <>
      <div className="card">
        <img
          className="card-img-top d-none d-sm-block"
          src={image || DEFAULT_GAME_IMG}
          alt="Game image"
        />
        <div className="card-body">
          <h5 className="card-title">{name}</h5>
          {!!description && <p className="card-text">{description}</p>}

          <div className="card-game-buttons">
            <Link href={`/game?hash=${hash}`}>
              <a className="btn btn-success me-2 mb-2">Open</a>
            </Link>
            {adminUser?.mode === USER_MODE_ADMIN && (
              <>
                <button
                  className="btn btn-primary me-2 mb-2"
                  onClick={() => setEditGameData(game)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger me-2 mb-2"
                  onClick={() =>
                    confirm('Are you sure?') && dispatch(deleteGame(hash))
                  }
                >
                  Delete Game
                </button>
                {!!codes.length && (
                  <AccessCodesTable mode="dark" codes={codes} />
                )}
                <hr />
                <button
                  onClick={() => dispatch(addCode(hash))}
                  className="btn btn-success"
                >
                  Get edit code
                </button>
                {!!code && (
                  <div>
                    <hr />
                    {code}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      {!!editGameData && (
        <EditGameModal
          game={editGameData}
          close={() => setEditGameData(null)}
        />
      )}
    </>
  );
};

export default GameDetails;
