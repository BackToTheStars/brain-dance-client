import { ROLES } from '@/config/user';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
import AdminTurnsTable from '../turns/Table';
import { deleteAdminGameRequest } from '../../requests';
import { Alert, Button } from 'antd';
import { useState } from 'react';
import { TID } from '@/config/testIds';

const AdminGameDetails = ({ game }) => {
  // удаление идёт через adminRequest: отказ приходит исключением с текстом сервера.
  // Раньше он уходил в console.error, и неудачное удаление выглядело как «ничего
  // не произошло» — страница просто не перезагружалась.
  const [deleteError, setDeleteError] = useState(null);
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
            <p>Published {dayjs(game.createdAt).fromNow()}</p>
            <Button
              className="px-2 py-1"
              type="primary"
              danger
              data-test-id={TID.adminGames.delete}
              onClick={() => {
                if (confirm('Delete the game?')) {
                  setDeleteError(null);
                  deleteAdminGameRequest(game._id)
                    .then(() => {
                      window.location.reload();
                    })
                    .catch((err) => {
                      setDeleteError(err?.message || String(err));
                    });
                }
              }}
            >
              Delete
            </Button>
            {!!deleteError && (
              <Alert
                className="mt-2"
                type="error"
                showIcon
                message={deleteError}
                data-test-id={TID.adminGames.deleteError}
              />
            )}
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
