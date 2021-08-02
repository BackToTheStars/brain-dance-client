import { useEffect, useRef } from 'react';
import Header from './Header';

const TurnNewComponent = ({ turn, can }) => {
  const { _id, x, y, width, height } = turn;
  const { contentType, header, backgroundColor, fontColor, dontShowHeader } =
    turn;

  const wrapperStyles = {
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`,
  };

  // подключаем useRef к div хода
  const wrapper = useRef(null);

  useEffect(() => {
    $(wrapper.current).resizable({});
    return () => $(wrapper.current).resizable('destroy');
  }, []);

  return (
    <div ref={wrapper} className="react-turn-new" style={wrapperStyles}>
      <Header
        style={
          contentType === 'comment' && !dontShowHeader
            ? { backgroundColor, color: fontColor || 'black' }
            : {}
        }
        can={can}
        header={header}
        handleEdit={null}
        handleDelete={null}
      />
      TurnNewComponent
    </div>
  );
};

export default TurnNewComponent;
