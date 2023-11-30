import { ArrowRightOutlined, InfoCircleOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

const getVideoImg = (url) => {
  if (url.match(/^(http[s]?:\/\/|)(www.|)youtu(.be|be.com)\//)) {
    const newVideoUrl = url.split('=')[1];
    return `https://img.youtube.com/vi/${newVideoUrl}/0.jpg`;
  } else {
    return '';
  }
};

const TurnCard = ({ turn }) => {
  const lineCount = useSelector((s) => s.lobby.textSettings.lineCount);
  const fontSize = useSelector((s) => s.lobby.textSettings.fontSize);
  const lineSpacing = useSelector((s) => s.lobby.textSettings.lineSpacing);
  const { header, imageUrl, videoUrl, paragraph, date, contentType } = turn;
  const text = (paragraph && paragraph[0]?.insert) || null;
  const videoImg = getVideoImg(videoUrl || '');
  const newDate = new Date(date);

  const limitLine = (line) => {
    return {
      WebkitLineClamp: `${line}`,
      WebkitBoxOrient: 'vertical',
      display: 'inline-block',
      display: '-webkit-box',
      maxHeight: 'auto',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    };
  };

  const minHeight = 150;

  const maxHeight = useMemo(() => {
    const maxHeightLimit = 1600;
    const newHeight = lineSpacing * fontSize * lineCount + 16;
    if (newHeight > maxHeightLimit) {
      return maxHeightLimit;
    }
    return newHeight;
  }, [lineCount, fontSize, lineSpacing]);

  return (
    <>
      <div
        className={`relative w-full group/item overflow-hidden rounded bg-dark-light`}
        style={{ maxHeight: `${maxHeight}px`, minHeight: `${minHeight}px` }}
      >
        {contentType !== 'comment' && (
          <div className="px-4 py-1 bg-main-dark">
            {!!header && (
              <Link
                href={'#'}
                className="text-lg"
                style={{
                  ...limitLine(2),
                  fontSize: `${headerFontSize}px`,
                  lineHeight: headerLineSpacing,
                }}
              >
                {header}
              </Link>
            )}
            {!!date && (
              <div>
                <time>{newDate.toLocaleDateString()}</time>
              </div>
            )}
          </div>
        )}
        <div className="px-4 py-4 bg-dark-light flex flex-col gap-y-4">
          {!!imageUrl && (
            <img src={imageUrl} alt="#" className={`w-full h-auto rounded`} />
          )}
          {!!videoImg && <img src={videoImg} />}
          {!!text && (
            <div
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: `${lineSpacing}`,
              }}
            >
              <p className="dark:text-white text-dark">{text}</p>
            </div>
          )}

          {/* ДОП КНОПКИ появляются сверху при ховере (Если не нужны можно удалить) */}

          <div
            className="absolute left-0 top-0 w-full transition-all duration-500 h-full opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible"
            style={{ backdropFilter: 'blur(1px)', filter: `grayscale(1)` }}
          ></div>

          {/* НАЗВАНИЕ ИГРЫ ИНФА И КНОПКА ПРИ ХОВЕРЕ */}
          <div
            className="absolute bottom-0 translate-y-[100%] group-hover/item:translate-y-[0] left-0 px-3 py-3 bg-main-dark bg-opacity-90 rounded-b w-full text-white transition-all"
            style={{ maxHeight: `calc(100% - 45px)` }}
          >
            {!!header && (
              <h4 className="pe-[70px] mb-1">
                <Link href={'#'} className="font-bold text-lg">
                  {header}
                </Link>
              </h4>
            )}
            <p className="mb-0 text-sm">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Totam,
              asperiores!
            </p>

            {/* КНОПКА (ПЕРЕХОД В САМУ ИГРУ)  */}

            <div className="absolute z-[1] top-[-15px] right-0 translate-x-full flex group-hover/item:translate-x-[-5px] transition-all py-[6px] px-3 rounded-btn-border bg-dark-light border border-main">
              <Link
                href={'#'}
                className="h-[16px] flex items-center justify-center pe-3 border-r border-main"
              >
                <InfoCircleOutlined />
              </Link>
              <Link
                href={'#'}
                className="h-[16px] flex items-center justify-center ps-3"
              >
                <ArrowRightOutlined />
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* <pre
        style={{
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          maxHeight: '700px',
          overflow: 'scroll',
        }}
      >
        {JSON.stringify(turn, null, 2)}
      </pre> */}
    </>
  );
};

export default TurnCard;
