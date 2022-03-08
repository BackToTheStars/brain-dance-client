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
    dispatch(quoteCoordsUpdate(_id, paragraphQuotes));
  }, [paragraphQuotes])

  return (
    <>
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
        }}
      />
      <ParagraphQuotes paragraphQuotes={paragraphQuotes} />
      <a
        className="widget-button"
        href="#"
        onClick={(e) => {
          e.preventDefault();
        }}
      >
        <i className="fas fa-highlighter"></i>
      </a>
    </>
  )
}

export default Paragraph