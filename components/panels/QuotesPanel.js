import { useTurnContext, ACTION_LINES_DELETE } from '../contexts/TurnContext';
import { RULE_TURNS_CRUD } from '../config';
import { useUserContext } from '../contexts/UserContext';

const cutTextToSize = (text, size) => {
  console.log(text, size);
  if (text.length < size + 3) return text;
  return text.slice(0, size) + '...';
};

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

  const clickedQuoteInfo =
    lineEnds[`${activeQuote.turnId}_${activeQuote.quoteId}`];
  const lines = clickedQuoteInfo ? clickedQuoteInfo.lines : [];

  return (
    <div className="quotes-panel panel">
      {/* <div>
        {activeQuote.turnId} {activeQuote.quoteId}
      </div> */}
      {!!lines.length && (
        <table className="table m-0 table-dark table-striped">
          <thead>
            <tr>
              <th>Author</th>
              <th>Type</th>
              <th>From</th>
              <th>To</th>
              {can(RULE_TURNS_CRUD) && <th className="text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {lines.map((line, index) => {
              const sourceQuoteInfo = quotesInfo[line.sourceTurnId].find(
                (quoteInfo) => line.sourceMarker === quoteInfo.quoteId
              );
              const targetQuoteInfo = quotesInfo[line.targetTurnId].find(
                (quoteInfo) => line.targetMarker === quoteInfo.quoteId
              );
              return (
                <tr key={index}>
                  <td>{line.author}</td>
                  <td>{line.type}</td>
                  <td>
                    {!!sourceQuoteInfo &&
                      cutTextToSize(sourceQuoteInfo.text, 20)}
                  </td>
                  <td>
                    {!!targetQuoteInfo &&
                      cutTextToSize(targetQuoteInfo.text, 20)}
                  </td>
                  {can(RULE_TURNS_CRUD) && (
                    <td className="text-right">
                      <button
                        // className="del-btn"
                        className="btn btn-danger"
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
