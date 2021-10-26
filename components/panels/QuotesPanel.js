import { useTurnContext, ACTION_LINES_DELETE } from '../contexts/TurnContext';
import { RULE_TURNS_CRUD } from '../config';
import { useUserContext } from '../contexts/UserContext';
import { useEffect, useState } from 'react';

const cutTextToSize = (text, size) => {
  console.log(text, size);
  if (text.length < size + 3) return text;
  return text.slice(0, size) + '...';
};

const QuotesPanel = () => {
  const { dispatch, activeQuote, lineEnds, quotesInfo, deleteLines } =
    useTurnContext();
  const [quotesOutOfScreenInfo, setQuotesOutOfScreenInfo] = useState({});
  const [preparedLines, setPreparedLines] = useState([]);
  const {
    can,
    request,
    info: { hash },
  } = useUserContext();
  // if (!activeQuote) return null; // прочитать о разнице с false

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

  useEffect(() => {
    if (!activeQuote) setQuotesOutOfScreenInfo({});

    const clickedQuoteInfo = !!activeQuote
      ? lineEnds[`${activeQuote.turnId}_${activeQuote.quoteId}`]
      : null;
    const lines = clickedQuoteInfo ? clickedQuoteInfo.lines : [];
    const preparedLines = lines.map((line) => {
      let turnIdOutOfScreen = null;
      let sourceQuoteInfo = {};
      let targetQuoteInfo = {};
      if (!!quotesInfo[line.sourceTurnId]) {
        sourceQuoteInfo = quotesInfo[line.sourceTurnId].find(
          (quoteInfo) => line.sourceMarker === quoteInfo.quoteId
        );
      } else {
        turnIdOutOfScreen = line.sourceTurnId;
      }

      if (!!quotesInfo[line.targetTurnId]) {
        targetQuoteInfo = quotesInfo[line.targetTurnId].find(
          (quoteInfo) => line.targetMarker === quoteInfo.quoteId
        );
      } else {
        turnIdOutOfScreen = line.targetTurnId;
      }

      return { ...line, sourceQuoteInfo, targetQuoteInfo, turnIdOutOfScreen };
    });
    setPreparedLines(preparedLines);
    const turnIdsOutOfScreen = preparedLines
      .filter((line) => !!line.turnIdOutOfScreen)
      .map((line) => line.turnIdOutOfScreen);

    if (!!turnIdsOutOfScreen.length) {
      request(
        `turns?hash=${hash}&turnIds=${turnIdsOutOfScreen.join(',')}`
      ).then((data) => {
        console.log(data);
        setPreparedLines(
          preparedLines.map((line) => {
            if (!!line.turnIdOutOfScreen) {
              debugger;
              // загружаем цитаты хода который не видно в области видимости
              const turnOutOfScreen = data.items.find(
                (turn) => turn._id === line.turnIdOutOfScreen
              );
              if (!Object.keys(line.sourceQuoteInfo).length) {
                return {
                  ...line,
                  sourceQuoteInfo: turnOutOfScreen.quotes.find(
                    (quote) => line.sourceMarker === quote.id
                  ),
                };
              }
              if (!Object.keys(line.targetQuoteInfo).length) {
                return {
                  ...line,
                  targetQuoteInfo: turnOutOfScreen.quotes.find(
                    (quote) => line.targetMarker === quote.id
                  ),
                };
              }
            } else return line;
          })
        );
      });
    }
    // console.log(turnIdsOutOfScreen);
  }, [activeQuote]);

  return (
    <div
      className={`${!preparedLines.length ? 'hidden' : ''} quotes-panel panel`}
    >
      {!!preparedLines.length && (
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
            {preparedLines.map((line, index) => {
              const { sourceQuoteInfo, targetQuoteInfo } = line;

              return (
                <tr key={index}>
                  <td>{line.author}</td>
                  <td>{line.type}</td>
                  <td>
                    {!!sourceQuoteInfo &&
                      cutTextToSize(sourceQuoteInfo.text || '', 22)}
                  </td>
                  <td>
                    {!!targetQuoteInfo &&
                      cutTextToSize(targetQuoteInfo.text || '', 22)}
                    {/* сделать резиновую обрезку текста */}
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
