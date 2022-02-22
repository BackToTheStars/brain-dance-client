import { quoteCoordsUpdate } from "@/modules/lines/redux/actions";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import ParagraphOriginal from "./ParagraphOriginal";
import ParagraphQuotes from "./ParagraphQuotes";

const Paragraph = ({turn, registerHandleResize, unregisterHandleResize}) => {
  const {
    paragraph,
    _id,
    backgroundColor,
    fontColor,
    contentType,
    scrollPosition,
    width,
    height,
  } = turn;

  const [paragraphElCurrent, setParagraphElCurrent] = useState(null);
  const [paragraphQuotes, setParagraphQuotes] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {
    if (!paragraphElCurrent) return;
    registerHandleResize({
      type: 'paragraph',
      id: 'paragraph',
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
        return paragraphElCurrent.scrollHeight + 5;
      },
    });
    return () => unregisterHandleResize({ id: 'paragraph' }); // return будет вызван только в момент unmount
  }, [paragraphElCurrent]);

  useEffect(() => {
    console.log("par quotes")
    dispatch(quoteCoordsUpdate(_id, paragraphQuotes));
  }, [paragraphQuotes])

  return (
    <>
      {/* {!!textPieces.length && (
        <Compressor
          {...{
            textPieces,
            // contentType,
            // backgroundColor,
            // fontColor,
            // variableHeight,
            compressedHeight,
            setCompressedHeight,
            // registerHandleResize,
            // unregisterHandleResize,
          }}
        />
      )} */}
      <ParagraphOriginal
        {...{
          // turn,
          setParagraphElCurrent,
          setParagraphQuotes,
          // setQuotesWithCoords,

          
          paragraph,
          _id,
          backgroundColor,
          fontColor,
          contentType,
          scrollPosition,
          width,
          height,
        }}
      />
      <ParagraphQuotes paragraphQuotes={paragraphQuotes} />
      <a
        className="widget-button"
        href="#"
        onClick={(e) => {
          e.preventDefault();
          interactWithWidget();
          // setInteractionMode(MODE_WIDGET_PARAGRAPH); // говорим набор кнопок для панели справа
          // makeWidgetActive(_id, WIDGET_PARAGRAPH, widgetId); // (turnId, widgetType, widgetId)
        }}
      >
        <i className="fas fa-highlighter"></i>
      </a>
    </>
  )
}

export default Paragraph