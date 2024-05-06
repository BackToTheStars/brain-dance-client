import { widgetSpacer } from '@/config/ui';
import { setPanelMode } from '@/modules/panels/redux/actions';
import { MODE_WIDGET_PARAGRAPH } from '@/config/panel';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getQueue } from '../../helpers/queueHelper';
import Compressor from './Compressor';
import ParagraphOriginal from './ParagraphOriginal';
import ParagraphQuotes from './ParagraphQuotes';
import { memo } from 'react';

const Paragraph = ({
  turnId,
  registerHandleResize,
  unregisterHandleResize,
  widgetId,
  widget,
  notRegisteredWidgetsCount,
}) => {
  const compressedWidget = useSelector(
    (state) => state.turns.d[turnId].data.dWidgets.c_1
  );
  const compressed = useSelector((state) => state.turns.d[turnId].data.compressed);
  const turnCompressedHeight = useSelector(
    (state) => state.turns.d[turnId].data.compressedHeight
  );

  const [compressedHeight, setCompressedHeight] =
    useState(turnCompressedHeight);

  const [paragraphElCurrent, setParagraphElCurrent] = useState(null);
  const [wrapperElCurrent, setWrapperElCurrent] = useState(null);

  const resultWidget = useMemo(()=> {
    return {
      ...widget,
      ...compressedWidget
    }
  }, [widget, compressedWidget])

  useEffect(() => {
    if (!compressed) {
      if (paragraphElCurrent) {
        registerHandleResize({
          type: 'paragraph',
          id: widgetId,
          // этот виджет является гибким
          variableHeight: true,
          minWidthCallback: () => {
            return 300;
          },
          minHeightCallback: () => {
            return 40;
          },
          getDesiredTurnHeight: ({
            minHeightBasic,
            newHeight,
            minHeight,
            maxHeight,
          }) => {
            // это для случая не-compressed
            return newHeight;
          },
          maxHeightCallback: () => {
            return paragraphElCurrent.scrollHeight + widgetSpacer + 5;
          },
        });
        return () => unregisterHandleResize({ id: 'paragraph' }); // return будет вызван только в момент unmount
      }
      return;
    }

    //******************
    if (!!compressed) {
      if (wrapperElCurrent) {
        return () => unregisterHandleResize({ id: 'paragraph' }); // return будет вызван только в момент unmount
      }
    }
  }, [wrapperElCurrent, paragraphElCurrent, compressed]);

  const registerHandleResizeWithParams = useCallback(
    ({ widgetMinHeight, widgetMaxHeight, widgetDesiredHeight }) => {
      registerHandleResize({
        type: 'paragraph',
        id: widgetId,
        // этот виджет является гибким
        variableHeight: true,
        desiredHeightCallback: () => {
          return widgetDesiredHeight;
        },
        minWidthCallback: () => {
          return 300;
        },
        minHeightCallback: () => {
          return widgetMinHeight;
        },
        getDesiredTurnHeight: ({
          minHeightBasic,
          newHeight,
          minHeight,
          maxHeight,
        }) => {
          // это для случая compressed
          if (compressedHeight) {
            return newHeight;
          } else {
            const resultHeight = minHeightBasic + widgetMinHeight;
            if (resultHeight >= minHeight && resultHeight <= maxHeight) {
              return resultHeight;
            } else {
              return newHeight;
            }
          }
        },
        maxHeightCallback: () => {
          return widgetMaxHeight;
        },
      });
    },
    [compressedHeight]);

  return (
    <>
      {compressed ? (
        <Compressor
          turnId={turnId}
          widget={resultWidget}
          widgetId={widgetId}
          compressedHeight={compressedHeight}
          setCompressedHeight={setCompressedHeight}
          setWrapperElCurrent={setWrapperElCurrent}
          registerHandleResizeWithParams={registerHandleResizeWithParams}
        />
      ) : (
        <ParagraphOriginal
          turnId={turnId}
          widgetId={widgetId}
          setParagraphElCurrent={setParagraphElCurrent}
          notRegisteredWidgetsCount={notRegisteredWidgetsCount}
        />
      )}
      <ParagraphQuotes turnId={turnId} />
    </>
  );
};

export default memo(Paragraph);
