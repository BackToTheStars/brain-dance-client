import { useTurnContext, ACTION_LINES_DELETE } from '../contexts/TurnContext';
import { RULE_TURNS_CRUD } from '../config';
import { useUserContext } from '../contexts/UserContext';

const QuotesPanel = () => {
  const { dispatch, activeQuote, lineEnds, quotesInfo, deleteLines } =
    useTurnContext();
  const { can } = useUserContext();
  if (!activeQuote) return null; // прочитать о разнице с false

  const handleDelete = (e, _id) => {
    e.preventDefault();
    if (confirm('Delete line?')) {
      // confirm - глобальная функция браузера
      deleteLines([_id], {
        successCallback: () => {
          dispatch({ type: ACTION_LINES_DELETE, payload: [_id] });
        },
      });

      //alert('button_delete_clicked');
    }
  };

  const clickedQuoteInfo = lineEnds[activeQuote.quoteId];
  const lines = clickedQuoteInfo ? clickedQuoteInfo.lines : [];

  return (
    <div className="quotes-panel">
      {/* <div>
        {activeQuote.turnId} {activeQuote.quoteId}
      </div> */}
      {!!lines.length && (
        <table>
          <thead>
            <tr>
              <th>Author</th>
              <th>Type</th>
              <th>From</th>
              <th>To</th>
              {can(RULE_TURNS_CRUD) && <th>actions</th>}
            </tr>
          </thead>
          <tbody>
            {lines.map((line, index) => {
              const sourceQuoteInfo = quotesInfo[line.sourceTurnId].find(
                (quoteInfo) => line.sourceMarker === quoteInfo.id
              );
              const targetQuoteInfo = quotesInfo[line.targetTurnId].find(
                (quoteInfo) => line.targetMarker === quoteInfo.id
              );
              return (
                <tr key={index}>
                  <td>{line.author}</td>
                  <td>{line.type}</td>
                  <td>{!!sourceQuoteInfo && sourceQuoteInfo.text}</td>
                  <td>{!!targetQuoteInfo && targetQuoteInfo.text}</td>
                  {can(RULE_TURNS_CRUD) && (
                    <td>
                      <button
                        className="del-btn"
                        onClick={(e) => handleDelete(e, line._id)}
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
      )}
    </div>
  );
};

export default QuotesPanel;
