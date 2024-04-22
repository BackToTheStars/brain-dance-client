import { RULE_TURNS_CRUD } from '@/config/user';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { useDispatch, useSelector } from 'react-redux';
import { filterLinesByQuoteKey } from '@/modules/lines/components/helpers/line';
import * as panelTypes from '@/modules/panels/redux/types';
import { lineDelete } from '@/modules/lines/redux/actions';
import { useEffect } from 'react';
import { PANEL_LINES } from '../settings';

const cutTextToSize = (text, size) => {
  if (text.length < size + 3) return text;
  return text.slice(0, size) + '...';
};

const getQuoteLabel = (quoteInfo) => {
  if (!quoteInfo) return '';
  if (quoteInfo.type === 'picture') return 'picture';
  {
    /* сделать резиновую обрезку текста */
  }
  return cutTextToSize(quoteInfo.text || '', 22);
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
      <td>{getQuoteLabel(sourceQuoteInfo)}</td>
      <td>{getQuoteLabel(targetQuoteInfo)}</td>
      {can(RULE_TURNS_CRUD) && (
        <td className="text-end">
          <button
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
  const lines = useSelector((state) => state.lines.lines);
  const activeQuoteKey = useSelector((state) => state.quotes.activeQuoteKey);
  const preparedLines = filterLinesByQuoteKey(lines, activeQuoteKey);

  const dispatch = useDispatch();
  const { can } = useUserContext();

  const handleDelete = (e, _id) => {
    e.preventDefault();
    if (confirm('Delete line?')) {
      dispatch(lineDelete(_id));
    }
  };

  // useEffect(() => {
  //   if (!preparedLines.length) {
  //     dispatch({
  //       type: panelTypes.PANEL_TOGGLE,
  //       payload: { open: false, type: PANEL_LINES },
  //     });
  //   }
  // }, [preparedLines]);

  if (!preparedLines.length) {
    return null;
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
