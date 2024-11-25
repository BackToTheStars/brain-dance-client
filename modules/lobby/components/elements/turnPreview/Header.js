import { useMemo } from 'react';
import { useSelector } from 'react-redux';

const TurnPreviewHeader = ({ header }) => {
  const cardPadding = useSelector((s) => s.lobby.textSettings.padding);
  const limitLineHeader = useSelector(
    (s) => s.lobby.textSettings.limitLineHeader,
  );

  const headerStyle = useMemo(
    () => ({
      WebkitLineClamp: limitLineHeader,
      padding: `${cardPadding}px`,
    }),
    [limitLineHeader, cardPadding],
  );

  return (
    <div className="base-card__header lines-limiter" style={headerStyle}>
      {header}
    </div>
  );
};

export default TurnPreviewHeader;
