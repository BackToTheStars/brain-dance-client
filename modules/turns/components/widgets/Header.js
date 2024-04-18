import React, { useRef, useEffect, useMemo, memo } from 'react';
import { HEADER_HEIGHT, HEADER_HEIGHT_2 } from '@/config/ui';
import DateAndSourceUrl from './header/DateAndSourceUrl';
import { getCommentHeaderColor } from '../helpers/colorHelper';
import { useSelector } from 'react-redux';
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
      style = {
        ...style,
        backgroundColor: getCommentHeaderColor(background),
        color: font || 'black',
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
      <div className="headerText turn-widget" ref={headerEl} style={style}>
        <div className="headerTextTitle">{text}</div>
        {!!(date || url) && <DateAndSourceUrl {...{ date, url }} />}
      </div>
    </>
  );
};

export default memo(Header);
