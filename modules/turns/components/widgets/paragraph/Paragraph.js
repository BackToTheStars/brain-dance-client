import { widgetSpacer } from '@/config/ui';
import { setPanelMode } from '@/modules/panels/redux/actions';
import { MODE_WIDGET_PARAGRAPH } from '@/modules/panels/settings';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getQueue } from '../../helpers/queueHelper';
import Compressor from './Compressor';
import ParagraphOriginal from './ParagraphOriginal';
import ParagraphQuotes from './ParagraphQuotes';

const Paragraph = ({
  turnId,
  registerHandleResize,
  unregisterHandleResize,
  widgetId,
  widget,
}) => {
  const compressed = useSelector((state) => state.turns.d[turnId].compressed);
  const turnCompressedHeight = useSelector(
    (state) => state.turns.d[turnId].compressedHeight
  );

  const [compressedHeight, setCompressedHeight] =
    useState(turnCompressedHeight);

  const [paragraphElCurrent, setParagraphElCurrent] = useState(null);
  const [wrapperElCurrent, setWrapperElCurrent] = useState(null);

  const dispatch = useDispatch();

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
            // if (!!compressed) {
            // } else if (!paragraphElCurrent) {
            //   return 0;
            // }
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

  const registerHandleResizeWithParams = ({
    widgetMinHeight,
    widgetMaxHeight,
    widgetDesiredHeight,
  }) => {
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

        // if (!!compressed) {
        // } else if (!paragraphElCurrent) {
        //   return 0;
        // }
        // return (
        //   // (compressed ? compressedHeight : paragraphElCurrent.scrollHeight) +
        //   // widgetSpacer +
        //   // 5
        //   wrapperElCurrent.scrollHeight + widgetSpacer + 5
        // );
      },
    });
  };

  return (
    <>
      {compressed ? (
        <Compressor
          {...{
            turnId,
            widget,
            widgetId,
            compressedHeight,
            setCompressedHeight,
            setWrapperElCurrent,
            registerHandleResizeWithParams,
          }}
        />
      ) : (
        <ParagraphOriginal
          {...{
            turnId,
            setParagraphElCurrent,
          }}
        />
      )}
      <ParagraphQuotes turnId={turnId} />
      <a
        className="widget-button"
        href="#"
        onClick={(e) => {
          e.preventDefault();
          dispatch(
            setPanelMode({
              mode: MODE_WIDGET_PARAGRAPH,
              params: { editTurnId: turnId, editWidgetId: widgetId },
            })
          );
        }}
      >
        <i className="fas fa-highlighter"></i>
      </a>
    </>
  );
};

export default Paragraph;
