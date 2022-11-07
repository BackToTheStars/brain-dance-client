import { widgetSpacer } from '@/config/ui';
import { quoteCoordsUpdate } from '@/modules/lines/redux/actions';
import { setPanelMode } from '@/modules/panels/redux/actions';
import { MODE_WIDGET_PARAGRAPH } from '@/modules/panels/settings';
import { TYPE_QUOTE_TEXT } from '@/modules/quotes/settings';
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

  const [paragraphElCurrent, setParagraphElCurrent] = useState(null);
  const [paragraphQuotes, setParagraphQuotes] = useState([]);

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
      {compressed ? (
        <Compressor className="compressor" {...{ _id, widgetId }} />
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
