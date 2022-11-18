import { widgetSpacer } from '@/config/ui';
import { quoteCoordsUpdate } from '@/modules/lines/redux/actions';
import { setPanelMode } from '@/modules/panels/redux/actions';
import { MODE_WIDGET_PARAGRAPH } from '@/modules/panels/settings';
import { TYPE_QUOTE_TEXT } from '@/modules/quotes/settings';
import { calculateTextPiecesFromQuotes } from 'old/components/turn/paragraph/helper';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Compressor from './Compressor';
import ParagraphOriginal from './ParagraphOriginal';
import ParagraphQuotes from './ParagraphQuotes';

const Paragraph = ({
  turn,
  registerHandleResize,
  unregisterHandleResize,
  stateIsReady,
  widgetId,
}) => {
  const {
    paragraph,
    _id,
    backgroundColor,
    fontColor,
    contentType,
    scrollPosition,
    width,
    height,
    compressed,
  } = turn;

  const panels = useSelector((state) => state.panels);
  const { editTurnId, editWidgetId, editWidgetParams } = panels;
  const [compressedHeight, setCompressedHeight] = useState(
    turn.compressedHeight
  );

  const [paragraphElCurrent, setParagraphElCurrent] = useState(null);
  // const [textPieces, setTextPieces] = useState([]); // элементы именно для сжатого параграфа

  const [paragraphQuotes, setParagraphQuotes] = useState([]);
  // console.log(paragraphQuotes);

  const textPieces = calculateTextPiecesFromQuotes(
    paragraphQuotes,
    paragraphElCurrent
  );

  const dispatch = useDispatch();

  useEffect(() => {
    if (!paragraphElCurrent) return;
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
        if (!paragraphElCurrent) {
          return 0;
        }
        // return paragraphElCurrent.scrollHeight + widgetSpacer + 5;
        return (
          (compressed ? compressedHeight : paragraphElCurrent.scrollHeight) +
          widgetSpacer +
          5
        );
      },
    });
    return () => unregisterHandleResize({ id: 'paragraph' }); // return будет вызван только в момент unmount
  }, [paragraphElCurrent, compressedHeight]);

  useEffect(() => {
    dispatch(quoteCoordsUpdate(_id, TYPE_QUOTE_TEXT, paragraphQuotes));
  }, [paragraphQuotes]);

  // useEffect(() => {
  //   if (!compressed) return;
  //   const textPieces = calculateTextPiecesFromQuotes(
  //     paragraphQuotes,
  //     paragraphElCurrent
  //   );

  //   // consoleLogLines(textPieces, updateDebugLines);
  //   // сообщаем шагу, что у нас есть настройки параграфа для операции Compress
  //   setTextPieces(textPieces);
  // }, [compressed]);

  // <Compressor className="compressor" {...{ turn, textPieces }} />
  return (
    <>
      {compressed ? (
        <Compressor
          {...{
            turn,
            textPieces,
            paragraphElCurrent,
            setParagraphElCurrent,
            compressedHeight,
            setCompressedHeight,
            stateIsReady,
          }}
        />
      ) : (
        <ParagraphOriginal
          {...{
            setParagraphElCurrent,
            setParagraphQuotes,
            paragraph,
            _id,
            backgroundColor,
            fontColor,
            contentType,
            scrollPosition,
            width,
            height,
            stateIsReady,
          }}
        />
      )}
      <ParagraphQuotes turnId={_id} paragraphQuotes={paragraphQuotes} />
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
