import { memo } from 'react';
import ParagraphOriginal from './ParagraphOriginal';
import ParagraphQuotes from './ParagraphQuotes';
import { useSelector } from 'react-redux';
import Compressor, { CompressorProvider } from './Compressor';

const Paragraph = ({
  turnId,
  widgetId,
  registerHandleResize,
  unregisterHandleResize,
  widgetsUpdatedTime,
}) => {
  const paragraphWidget = useSelector(
    (state) => state.turns.d[turnId]?.dWidgets?.[widgetId],
  );
  return (
    <>
      {paragraphWidget?.compressed ? (
        <CompressorProvider>
          <Compressor
            turnId={turnId}
            widgetId={widgetId}
            registerHandleResize={registerHandleResize}
            unregisterHandleResize={unregisterHandleResize}
            widgetsUpdatedTime={widgetsUpdatedTime}
          />
        </CompressorProvider>
      ) : (
        <ParagraphOriginal
          turnId={turnId}
          widgetId={widgetId}
          registerHandleResize={registerHandleResize}
          unregisterHandleResize={unregisterHandleResize}
          widgetsUpdatedTime={widgetsUpdatedTime}
        />
      )}
      <ParagraphQuotes turnId={turnId} widgetId={widgetId} />
    </>
  );
};

export default memo(Paragraph);
