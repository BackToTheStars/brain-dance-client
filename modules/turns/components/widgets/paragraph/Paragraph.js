import { widgetSpacer } from '@/config/ui';
import { quoteCoordsUpdate } from '@/modules/lines/redux/actions';
import { setPanelMode } from '@/modules/panels/redux/actions';
import { MODE_WIDGET_PARAGRAPH } from '@/modules/panels/settings';
import { TYPE_QUOTE_TEXT } from '@/modules/quotes/settings';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import ParagraphOriginal from './ParagraphOriginal';
import ParagraphQuotes from './ParagraphQuotes';

const Paragraph = ({
  turn,
  registerHandleResize,
  unregisterHandleResize,
  stateIsReady,
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
  } = turn;

  const [paragraphElCurrent, setParagraphElCurrent] = useState(null);
  const [paragraphQuotes, setParagraphQuotes] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {
    if (!paragraphElCurrent) return;
    registerHandleResize({
      type: 'paragraph',
      id: 'paragraph1',
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
        return paragraphElCurrent.scrollHeight + widgetSpacer + 5;
      },
    });
    return () => unregisterHandleResize({ id: 'paragraph' }); // return будет вызван только в момент unmount
  }, [paragraphElCurrent]);

  useEffect(() => {
    dispatch(quoteCoordsUpdate(_id, TYPE_QUOTE_TEXT, paragraphQuotes));
  }, [paragraphQuotes]);

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
          stateIsReady,
        }}
      />
      <ParagraphQuotes turnId={_id} paragraphQuotes={paragraphQuotes} />
      <a
        className="widget-button"
        href="#"
        onClick={(e) => {
          e.preventDefault();
          dispatch(
            setPanelMode({
              mode: MODE_WIDGET_PARAGRAPH,
              params: { editTurnId: _id },
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