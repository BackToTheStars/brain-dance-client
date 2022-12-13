import { widgetSpacer } from '@/config/ui';
import { setPanelMode } from '@/modules/panels/redux/actions';
import { MODE_WIDGET_PARAGRAPH } from '@/modules/panels/settings';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Compressor from './Compressor';
import ParagraphOriginal from './ParagraphOriginal';
import ParagraphQuotes from './ParagraphQuotes';

const Paragraph = ({
  turn,
  registerHandleResize,
  unregisterHandleResize,
  // stateIsReady,
  widgetId,
  // paragraphIsReady,
  // setParagraphIsReady,
  height,
}) => {
  console.log('paragraph height');
  console.log({ height });

  const { _id, compressed } = turn;

  const [compressedHeight, setCompressedHeight] = useState(
    turn.compressedHeight
  );

  const [paragraphElCurrent, setParagraphElCurrent] = useState(null);
  const [wrapperElCurrent, setWrapperElCurrent] = useState(null);

  const dispatch = useDispatch();

  useEffect(() => {
    // console.log({
    //   wrapperElCurrent,
    //   paragraphElCurrent,
    //   compressedHeight,
    //   compressed,
    // });

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
          maxHeightCallback: () => {
            // if (!!compressed) {
            // } else if (!paragraphElCurrent) {
            //   return 0;
            // }
            return (
              // (compressed ? compressedHeight : paragraphElCurrent.scrollHeight) +
              // widgetSpacer +
              // 5
              paragraphElCurrent.scrollHeight + widgetSpacer + 5
            );
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
            turn,
            compressedHeight,
            setCompressedHeight,
            // stateIsReady,
            setWrapperElCurrent,
            registerHandleResizeWithParams,
            // setParagraphIsReady,
            height,
            // paragraphIsReady,
          }}
        />
      ) : (
        <ParagraphOriginal
          {...{
            turn,
            setParagraphElCurrent,
            // stateIsReady,
            // setParagraphIsReady,
          }}
        />
      )}
      <ParagraphQuotes turnId={_id} />
      <a
        className="widget-button"
        href="#"
        onClick={(e) => {
          e.preventDefault();
          dispatch(
            setPanelMode({
              mode: MODE_WIDGET_PARAGRAPH,
              params: { editTurnId: _id, editWidgetId: widgetId },
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
