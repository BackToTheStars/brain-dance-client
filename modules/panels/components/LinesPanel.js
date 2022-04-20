// import {
//   useTurnsCollectionContext,
//   ACTION_LINES_DELETE,
// } from '../contexts/TurnsCollectionContext';
import { RULE_TURNS_CRUD } from '@/config/user';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { filterLinesByQuoteKey } from '@/modules/lines/components/helpers/line';
import { deleteLineRequest } from '@/modules/lines/requests';
import { lineDelete } from '@/modules/lines/redux/actions';
// import { useInteractionContext } from '../contexts/InteractionContext';

const cutTextToSize = (text, size) => {
  // console.log(text, size);
  if (text.length < size + 3) return text;
  return text.slice(0, size) + '...';
};

const LineRow = ({ line, can, handleDelete }) => {
  const sourceQuoteInfo = useSelector(
    (state) => state.quotes.d[`${line.sourceTurnId}_${line.sourceMarker}`]
  );
  const targetQuoteInfo = useSelector(
    (state) => state.quotes.d[`${line.targetTurnId}_${line.targetMarker}`]
  );
  return (
    <tr>
      <td>{line.author}</td>
      <td>{line.type}</td>
      <td>
        {!!sourceQuoteInfo && cutTextToSize(sourceQuoteInfo.text || '', 22)}
      </td>
      <td>
        {!!targetQuoteInfo && cutTextToSize(targetQuoteInfo.text || '', 22)}
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
};

const LinesPanel = () => {
  // const { dispatch, deleteLines } = useTurnsCollectionContext();

  const lines = useSelector((state) => state.lines.lines);
  const activeQuoteKey = useSelector((state) => state.quotes.activeQuoteKey);
  const preparedLines = filterLinesByQuoteKey(lines, activeQuoteKey);

  const dispatch = useDispatch();
  const deleteLines = () => {};
  const { can } = useUserContext();
  // const {
  //   bottomPanelSettings: { setPanelType },
  // } = useInteractionContext();

  const [preparedLinesCount, setPreparedLinesCount] = useState(
    preparedLines.length
  );

  // if (!activeQuote) return null; // прочитать о разнице с false

  const handleDelete = (e, _id) => {
    e.preventDefault();
    if (confirm('Delete line?')) {
      dispatch(lineDelete(_id));
      // confirm - глобальная функция браузера
      // deleteLines([_id], {
      //   successCallback: () => {
      //     dispatch({ type: ACTION_LINES_DELETE, payload: [_id] });
      //   },
      // });
      //alert('button_delete_clicked');
    }
  };

  // useEffect(() => {
  //   setPreparedLinesCount(preparedLines.length);
  //   if (!preparedLines.length && preparedLinesCount > 0) {
  //     setPanelType(null);
  //   }
  // }, [preparedLines]);

  if (!preparedLines.length) {
    return 'no preparedLines';
  }

  return (
    // <div className={`${!preparedLines.length ? 'hidden' : ''} panel`}>
    //   {!!preparedLines.length && (
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
            <LineRow
              key={index}
              line={line}
              can={can}
              handleDelete={handleDelete}
            />
          );
        })}
      </tbody>
    </table>
    //   )}
    // </div>
  );
};

export default LinesPanel;
