import { RULE_TURNS_CRUD } from '../config';
import { useUserContext } from '../contexts/UserContext';
import { useTurnContext } from '../contexts/TurnContext';
import { paragraphToString } from '../helpers/quillHandler';
import { useEffect } from 'react';
import { useInteractionContext } from '../contexts/InteractionContext';

const PasteTurnPanel = () => {
  //
  const { getTurnsFromBuffer, can, getTurnFromBufferAndRemove } =
    useUserContext();
  const { insertTurnFromBuffer } = useTurnContext();
  const turnsToPaste = getTurnsFromBuffer();
  const {
    bottomPanelSettings: { setPanelType }, // @learn {} второго уровня в деструктуризаторе (можно любую вложенность)
  } = useInteractionContext();

  useEffect(() => {
    if (!turnsToPaste.length) {
      setPanelType(null);
    }
  }); // @learn усли второго аргумента нет, то компонент реагирует на любые изменения,
  // через props, contexts, на все хуки и пропсы

  return (
    <table className="table m-0 table-dark table-striped">
      <thead>
        <tr>
          <th>Title</th>
          <th>Text</th>
          {can(RULE_TURNS_CRUD) && <th className="text-right">Actions</th>}
        </tr>
      </thead>
      <tbody>
        {turnsToPaste.map((turn, index) => {
          const { header, timeStamp, paragraph } = turn;
          return (
            <tr key={index}>
              <td>
                <div className="text-cut-to-size max-header">{header}</div>
              </td>
              <td>
                <div className="text-cut-to-size max-paragraph">
                  {paragraphToString(paragraph, 200)}
                </div>
              </td>
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
                    onClick={() => {
                      getTurnFromBufferAndRemove(timeStamp);
                    }}
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
