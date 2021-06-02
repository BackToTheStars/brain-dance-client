import { useTurnContext } from '../contexts/TurnContext';
import { RULE_TURNS_CRUD } from '../config';
import { useUserContext } from '../contexts/UserContext';

const QuotesPanel = () => {
  const { dispatch, activeQuote } = useTurnContext();
  const { can } = useUserContext();
  const lines = [];
  if (!activeQuote) return null; // прочитать о разнице с false

  const handleDelete = () => {
    return null;
  };

  return (
    <div className="quotes-panel">
      <div>
        {activeQuote.turnId} {activeQuote.quoteId}
      </div>
      {!!lines.length && (
        <table>
          <thead>
            <tr>
              <th>from</th>
              <th>to</th>${can(RULE_TURNS_CRUD) && <th>actions</th>}
            </tr>
          </thead>
          <tbody>
            {lines.map((line, index) => {
              return (
                <tr key={index}>
                  <td>{line.sourceQuote.el.text().trim()}</td>
                  <td>{line.targetQuote.el.text().trim()}</td>
                  {can(RULE_TURNS_CRUD) && (
                    <td>
                      <button class="del-btn" onClick={handleDelete}>
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
