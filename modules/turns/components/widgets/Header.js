import React, { useRef, useEffect, useMemo } from 'react';
import { HEADER_HEIGHT, HEADER_HEIGHT_2 } from '@/config/ui';
import DateAndSourceUrl from './header/DateAndSourceUrl';
import ButtonsMenu from './header/ButtonsMenu';
//const HEADER_HEIGHT = 105;

const Header = ({
  registerHandleResize,
  _id,
  header,
  contentType,
  backgroundColor,
  fontColor,
  dontShowHeader,
  sourceUrl,
  date,
}) => {
  const headerEl = useRef(null);

  const headerHeight = !!sourceUrl || !!date ? HEADER_HEIGHT : HEADER_HEIGHT_2;

  const style = useMemo(() => {
    let style = {
      height: `${headerHeight}px`,
    };
    if (contentType === 'comment' && !dontShowHeader) {
      style = { ...style, backgroundColor, color: fontColor || 'black' };
    }
    return style;
  }, [dontShowHeader, backgroundColor, fontColor, contentType]);

  useEffect(() => {
    registerHandleResize({
      type: 'header',
      id: 'header1',
      minWidthCallback: () => 300,
      minHeightCallback: () => {
        return dontShowHeader ? 0 : headerHeight;
      },
      maxHeightCallback: () => (dontShowHeader ? 0 : headerHeight),
    });
  }, [dontShowHeader]);

  return (
    <>
      <div className="headerText" ref={headerEl} style={style}>
        <div className="headerTextTitle">{header}</div>
        {!!(date || sourceUrl) && <DateAndSourceUrl {...{ date, sourceUrl }} />}
      </div>
      <ButtonsMenu {...{ _id }} />
    </>
  );
};

const MemorizedHeader = React.memo(Header);

export default MemorizedHeader;
