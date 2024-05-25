import { ROLES } from '@/config/user';
import moment from 'moment';
import AdminTurnsTable from '../turns/Table';
import { deleteAdminGameRequest } from '../../requests';
import { Button } from 'antd';

const AdminGameDetails = ({ game }) => {
  return (
    <>
      <div className="h-[325px]">
        <div className="text-2xl font-bold py-4">{game.name}</div>
        <div className="flex gap-2">
          <div className="w-1/2">
            <p>{game.public ? 'Public' : 'Private'}</p>
            <div className="border border-gray-300 p-4 overflow-y-auto max-h-[150px]">
              <ul>
                {game.codes.map((code) => (
                  <li key={code._id}>
                    <b>{ROLES[code.role].name}</b> {code.hash}
                  </li>
                ))}
              </ul>
            </div>
            <p>{game.turnsCount} turns</p>
            <p>Published {moment(game.createdAt).fromNow()}</p>
            <Button
              className="px-2 py-1"
              type="primary"
              danger
              onClick={() => {
                if (confirm('Delete the game?')) {
                  deleteAdminGameRequest(game._id)
                    .then(() => {
                      window.location.reload();
                    })
                    .catch((err) => {
                      console.error(err);
                    });
                }
              }}
            >
              Delete
            </Button>
          </div>
          <div className="w-1/2">
            {game.image && (
              <img
                src={game.image}
                alt="game image"
                className="max-h-full max-w-full"
              />
            )}
          </div>
        </div>
      </div>
      <div>
        <AdminTurnsTable gameId={game._id} />
      </div>
    </>
  );
};

export default AdminGameDetails;
