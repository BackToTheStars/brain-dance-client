import { useEffect, useRef } from 'react';
import { RULE_TURNS_CRUD } from '../config';
import { ACTION_DELETE_TURN } from '../contexts/TurnsCollectionContext';
import { useTurnContext } from '../contexts/TurnContext';
import { dataCopy, fieldRemover } from '../helpers/formatters/dataCopier';
import { HEADER_HEIGHT } from '../const';
import { MODE_GAME } from '../contexts/InteractionContext';

const Header = ({ registerHandleResize }) => {
  const {
    dispatch,
    deleteTurn,
    can,
    turn,
    saveTurnInBuffer,
    tempMiddlewareFn,
    setInteractionMode,
  } = useTurnContext();

  const {
    _id,
    header,
    contentType,
    backgroundColor,
    fontColor,
    dontShowHeader,
  } = turn;
  const headerEl = useRef(null);
  const style =
    contentType === 'comment' && !dontShowHeader
      ? { backgroundColor, color: fontColor || 'black' }
      : {};

  const handleCut = async (e) => {
    e.preventDefault();
    if (confirm('Точно вырезать?')) {
      handleClone(e);
      // confirm - глобальная функция браузера
      _deleteTurnAndLines();
    }
  };

  const handleClone = async (e) => {
    e.preventDefault();
    const copiedTurn = dataCopy(turn);
    // @todo: проверить, откуда появляется _id в quotes
    copiedTurn.quotes = copiedTurn.quotes.map((quote) => ({
      id: quote.id,
      type: quote.type,
      text: quote.text, // @todo добавить это поле потом, сохранение по кнопке Save Turn
      x: quote.x,
      y: quote.y,
      height: quote.height,
      width: quote.width,
    }));

    copiedTurn.originalId = copiedTurn._id; // copiedTurn.originalId ||
    const copiedTurnId = copiedTurn._id;

    const fieldsToKeep = [
      'originalId',
      'header',
      'dontShowHeader',
      'imageUrl',
      'videoUrl',
      'date',
      'sourceUrl',
      'backgroundColor',
      'fontColor',

      'contentType',
      'paragraph',
      'quotes', // @todo: check
      'scrollPosition',
      'height',
      'width',
    ];
    fieldRemover(copiedTurn, fieldsToKeep); // передали {ход} и [сохраняемые поля]

    const linesFieldsToKeep = [
      'sourceMarker',
      'sourceTurnId',
      'targetMarker',
      'targetTurnId',
      'type',
    ];

    const copiedLines = dataCopy(
      lines.filter(
        (line) =>
          line.sourceTurnId === copiedTurnId ||
          line.targetTurnId === copiedTurnId
      )
    );
    copiedLines.forEach((line) => fieldRemover(line, linesFieldsToKeep));

    saveTurnInBuffer({ copiedTurn, copiedLines }); // сохранили turn в LocalStorage
    addNotification({
      title: 'Info:',
      text: 'Turn was copied, ready to paste',
    });
    // { title: 'Info:', text: 'Field has been saved' }
  };

  const handleEdit = (e) => {
    e.preventDefault();
    // @todo объединить
    dispatch({ type: ACTION_SET_TURN_TO_EDIT_MODE, payload: { _id } });
    setCreateEditTurnPopupIsHidden(false);
    // alert('button_edit_clicked');
  };

  const _deleteTurnAndLines = () => {
    tempMiddlewareFn(
      { type: ACTION_DELETE_TURN, payload: { _id } },
      {
        successCallback: () => {
          deleteTurn(_id, {
            successCallback: () => {
              dispatch({ type: ACTION_DELETE_TURN, payload: { _id } });
              setInteractionMode(MODE_GAME);
            },
          });
        },
      }
    );
  };

  const handleDelete = (e) => {
    e.preventDefault();
    if (confirm('Точно удалить?')) {
      // confirm - глобальная функция браузера
      _deleteTurnAndLines();
    }
  };

  useEffect(() => {
    registerHandleResize({
      type: 'header',
      id: 'header',
      minWidthCallback: () => 300,
      minHeightCallback: () => (dontShowHeader ? 0 : HEADER_HEIGHT),
      maxHeightCallback: () => (dontShowHeader ? 0 : HEADER_HEIGHT),
    });
  }, [dontShowHeader]);

  // @todo: update styles
  style.height = `${HEADER_HEIGHT}px`;

  return (
    <h5 className="headerText" ref={headerEl} style={style}>
      <div className="headerTextTitle">{header}</div>
      <div className="headerTextActions">
        {can(RULE_TURNS_CRUD) && (
          <>
            <a key="cut" className="cut-btn" onClick={handleCut}>
              <i className="fas fa-cut"></i>
            </a>
          </>
        )}

        <a key="clone" className="clone-btn" onClick={handleClone}>
          <i className="fas fa-clone"></i>
        </a>

        {can(RULE_TURNS_CRUD) && (
          <>
            <a key="edit" className="edit-btn" onClick={handleEdit}>
              <i className="fas fa-pen-square"></i>
            </a>

            <a key="delete" className="delete-btn" onClick={handleDelete}>
              <i className="fas fa-trash-alt"></i>
            </a>
          </>
        )}
      </div>
    </h5>
  );
};

export default Header;
