import React, { useRef, useEffect, useMemo, memo } from 'react';
import { HEADER_HEIGHT, HEADER_HEIGHT_2 } from '@/config/ui';
import DateAndSourceUrl from './header/DateAndSourceUrl';
import { getCommentHeaderColor } from '../helpers/colorHelper';
import { useSelector } from 'react-redux';
import { getNeedBlackText } from '../helpers/color';
//const HEADER_HEIGHT = 105;

const Header = ({ widgetId, registerHandleResize, _id }) => {
  const contentType = useSelector((state) => state.turns.d[_id].data.contentType);
  const { url, date } = useSelector((state) => state.turns.d[_id].data.dWidgets.s_1);
  const { text, show } = useSelector(
    (state) => state.turns.d[_id].data.dWidgets[widgetId]
  );
  const { font, background } = useSelector(
    (state) => state.turns.d[_id].data.colors
  );

  const headerEl = useRef(null);

  const headerHeight = !!url || !!date ? HEADER_HEIGHT : HEADER_HEIGHT_2;

  const style = useMemo(() => {
    let style = {
      height: `${headerHeight}px`,
    };
    if (contentType === 'comment' && show) {
      const backgroundColor = getCommentHeaderColor(background);
      style = {
        ...style,
        backgroundColor,
        color: font || getNeedBlackText(backgroundColor) ? '#000' : '#fff',
      };
    }
    return style;
  }, [show, background, font, contentType]);

  useEffect(() => {
    registerHandleResize({
      type: 'header',
      id: 'header1',
      minWidthCallback: () => 300,
      minHeightCallback: () => {
        return !show ? 0 : headerHeight;
      },
      maxHeightCallback: () => (!show ? 0 : headerHeight),
    });
  }, [show]);

  return (
    <>
      <div
        className="stb-widget-header headerText turn-widget"
        ref={headerEl}
        style={style}
      >
        <div className="headerTextTitle stb-widget-header__title">{text}</div>
        {!!(date || url) && <DateAndSourceUrl {...{ date, url }} />}
      </div>
    </>
  );
};

export default memo(Header);
