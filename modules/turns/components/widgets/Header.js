import React, { useRef, useEffect, useMemo, memo } from 'react';
import { HEADER_HEIGHT, HEADER_HEIGHT_2 } from '@/config/ui';
import DateAndSourceUrl from './header/DateAndSourceUrl';
import { getCommentHeaderColor } from '../helpers/colorHelper';
import { useSelector } from 'react-redux';
import { getNeedBlackText } from '../helpers/color';
import { TURN_SIZE_MIN_WIDTH } from '@/config/turn';
import { WIDGET_HEADER } from '../../settings';
//const HEADER_HEIGHT = 105;

const Header = ({
  widgetId,
  registerHandleResize,
  unregisterHandleResize,
  _id,
}) => {
  const contentType = useSelector((state) => state.turns.d[_id].contentType);
  const { url, date } = useSelector((state) => state.turns.d[_id].dWidgets.s_1);
  const { text, show } = useSelector(
    (state) => state.turns.d[_id].dWidgets[widgetId],
  );
  const { font, background } = useSelector(
    (state) => state.turns.d[_id].colors,
  );

  const headerEl = useRef(null);

  const headerHeight = !!url || !!date ? HEADER_HEIGHT : HEADER_HEIGHT_2;

  const { wrapperStyle, titleStyle } = useMemo(() => {
    const wrapperStyle = {
      height: `${headerHeight}px`,
    };
    const titleStyle = {};
    if (contentType === 'comment' && show) {
      const backgroundColor = getCommentHeaderColor(background);
      wrapperStyle.backgroundColor = backgroundColor;
      titleStyle.color = getNeedBlackText(background) ? '#000' : '#fff';
    }
    return { wrapperStyle, titleStyle };
  }, [show, background, font, contentType]);

  useEffect(() => {
    registerHandleResize({
      type: WIDGET_HEADER,
      id: widgetId,
      minWidthCallback: () => TURN_SIZE_MIN_WIDTH,
      minHeightCallback: () => {
        return !show ? 0 : headerHeight;
      },
      maxHeightCallback: () => (!show ? 0 : headerHeight),
    });
    return () => unregisterHandleResize({ id: widgetId });
  }, [show]);

  return (
    <>
      <div
        className="stb-widget-header turn-widget"
        ref={headerEl}
        style={wrapperStyle}
      >
        <div className="stb-widget-header__title" style={titleStyle}>
          {text}
        </div>
        {!!(date || url) && <DateAndSourceUrl date={date} url={url} />}
      </div>
    </>
  );
};

export default memo(Header);
