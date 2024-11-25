import { useMemo } from 'react';
import { useSelector } from 'react-redux';

const minHeight = 150;

const TurnPreviewWrapper = ({ children }) => {
  const fontSize = useSelector((s) => s.lobby.textSettings.fontSize);
  const lineCount = useSelector((s) => s.lobby.textSettings.lineCount);
  const lineSpacing = useSelector((s) => s.lobby.textSettings.lineSpacing);

  const maxHeight = useMemo(() => {
    const maxHeightLimit = 1600;
    const newHeight = lineSpacing * fontSize * lineCount + 16;
    if (newHeight > maxHeightLimit) {
      return maxHeightLimit;
    }
    return newHeight;
  }, [lineCount, fontSize, lineSpacing]);

  const wrapperStyle = useMemo(() => {
    return {
      minHeight: `${minHeight}px`,
      maxHeight: `${maxHeight}px`,
    };
  }, [minHeight, maxHeight]);

  return (
    <div className="base-card base-card_turn" style={wrapperStyle}>
      {children}
    </div>
  );
};

export default TurnPreviewWrapper;
