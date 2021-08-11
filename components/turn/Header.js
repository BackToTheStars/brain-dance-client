import { useEffect, useRef } from 'react';
import { RULE_TURNS_CRUD } from '../config';

const HEADER_HEIGHT = 40;

const Header = ({
  style,
  can,
  header,
  handleDelete,
  handleEdit,
  registerHandleResize,
}) => {
  const headerEl = useRef(null);

  useEffect(() => {
    registerHandleResize({
      type: 'header',
      id: 'header',
      minWidthCallback: () => {
        return 300;
      },
      minHeightCallback: () => {
        return HEADER_HEIGHT;
      },
      maxHeightCallback: () => {
        return HEADER_HEIGHT;
      },
    });
  }, []);

  // @todo: update styles
  style.height = `${HEADER_HEIGHT}px`;

  return (
    <h5 className="headerText" ref={headerEl} style={style}>
      <div className="headerTextTitle">{header}</div>
      <div className="headerTextActions">
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
