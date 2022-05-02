import { RULE_TURNS_CRUD } from '@/config/user';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { useDispatch, useSelector } from 'react-redux';
import { filterLinesByQuoteKey, filterLinesByQuoteKeys, filterLinesByTurnId } from '@/modules/lines/components/helpers/line';
import { lineDelete } from '@/modules/lines/redux/actions';

const cutTextToSize = (text, size) => {
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
        <td className="text-end">
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
  const editTurnId = useSelector((state) => state.panels.editTurnId);
  const turn = useSelector((state) => state.turns.d[editTurnId])

  const lines = useSelector((state) => state.lines.lines);
  const activeQuoteKey = useSelector((state) => state.quotes.activeQuoteKey);
  const preparedLines = turn ? filterLinesByTurnId(lines, turn._id) : filterLinesByQuoteKey(lines, activeQuoteKey);

  const dispatch = useDispatch();
  const { can } = useUserContext();

  const handleDelete = (e, _id) => {
    e.preventDefault();
    if (confirm('Delete line?')) {
      dispatch(lineDelete(_id));
    }
  };

  if (!preparedLines.length) {
    return 'no preparedLines';
  }

  return (
    <table className="table m-0 table-dark table-striped">
      <thead>
        <tr>
          <th>Author</th>
          <th>Type</th>
          <th>From</th>
          <th>To</th>
          {can(RULE_TURNS_CRUD) && <th className="text-end">Actions</th>}
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
  );
};

export default LinesPanel;
