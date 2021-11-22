import { RULE_TURNS_CRUD } from '../config';
import { useUserContext } from '../contexts/UserContext';
import { useTurnContext } from '../contexts/TurnContext';

const PasteTurnPanel = () => {
  //
  const { getTurnsFromBuffer, can } = useUserContext();
  const { insertTurnFromBuffer } = useTurnContext();
  const turnsToPaste = getTurnsFromBuffer();
  return (
    <table className="table m-0 table-dark table-striped">
      <thead>
        <tr>
          <th>Header</th>
          {can(RULE_TURNS_CRUD) && <th className="text-right">Actions</th>}
        </tr>
      </thead>
      <tbody>
        {turnsToPaste.map((turn, index) => {
          const { header, timeStamp } = turn;

          return (
            <tr key={index}>
              <td>{header}</td>
              {can(RULE_TURNS_CRUD) && (
                <td className="text-right">
                  <button
                    // className="del-btn"
                    className="btn btn-primary mr-2"
                    onClick={() => {
                      insertTurnFromBuffer(timeStamp, {
                        successCallback: () => {
                          console.log('success inserted turn from buffer');
                        },
                        errorCallback: (message) => {
                          console.log(message);
                        },
                      });
                    }}
                  >
                    Paste
                  </button>
                  <button
                    // className="del-btn"
                    className="btn btn-danger"
                    onClick={() => {}}
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default PasteTurnPanel;
