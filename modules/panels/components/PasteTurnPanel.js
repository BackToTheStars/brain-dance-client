import { useEffect } from 'react';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { useDispatch, useSelector } from 'react-redux';
import { RULE_TURNS_CRUD } from '@/config/user';
import { removeTurnFromBuffer } from '@/modules/turns/redux/actions';
// import dynamic from 'next/dynamic';

// const quillHelper = dynamic(
//   () => import('@/modules/turns/components/helpers/quillHelper'),
//   {
//     ssr: false,
//   }
// );
// const { paragraphToString } = quillHelper;
// import { paragraphToString } from '@/modules/turns/components/helpers/quillHelper';
const paragraphToString = (paragraph, length = 200) => {
  const text = paragraph
    .map((item) => item.insert)
    .join('')
    .trim();

  return text.length > length ? `${text.slice(0, length)}...` : text;
};

const PasteTurnPanel = () => {
  //
  const dispatch = useDispatch();
  const getTurnFromBufferAndRemove = () => {};
  const setPanelType = () => {};
  const insertTurnFromBuffer = () => {};

  const { can } = useUserContext();
  // const { insertTurnFromBuffer } = useTurnsCollectionContext();
  const turnsToPaste = useSelector((state) => state.turns.turnsToPaste);

  // const {
  //   bottomPanelSettings: { setPanelType }, // @learn {} второго уровня в деструктуризаторе (можно любую вложенность)
  // } = useInteractionContext();

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
                <td className="text-end">
                  <button
                    // className="del-btn"
                    className="btn btn-primary me-2"
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
                      if (confirm('Confirm: Delete turn from buffer?')) {
                        dispatch(removeTurnFromBuffer(timeStamp));
                      }
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
