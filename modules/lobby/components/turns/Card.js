import Link from 'next/link';
import { useEffect, useState } from 'react';

const getVideoImg = (url) => {
  if (url.match(/^(http[s]?:\/\/|)(www.|)youtu(.be|be.com)\//)) {
    const newVideoUrl = url.split('=')[1];
    return `https://img.youtube.com/vi/${newVideoUrl}/0.jpg`;
  } else {
    return '';
  }
};

const TurnCard = ({ turn }) => {
  const { header, imageUrl, videoUrl, paragraph, date, contentType } = turn;
  const text = (paragraph && paragraph[0]?.insert) || null;
  const videoImg = getVideoImg(videoUrl || '');
  const newDate = new Date(date);

  const [maxHeight, setMaxHeight] = useState(500);

  const defaultMaxHeight = 1600;
  const line = 20;
  const lineSpacing = 2.5;
  const fontSize = 16;

  useEffect(() => {
    setMaxHeight((prev) =>
      prev >= defaultMaxHeight
        ? defaultMaxHeight
        : lineSpacing * fontSize * line + 16
    );
  }, []);

  return (
    <>
      <div
        className={`relative w-full group/item overflow-y-auto overflow-x-hidden rounded`}
        style={{ maxHeight: `${maxHeight}px` }}
      >
        {contentType !== 'comment' && (
          <div className="p-4 bg-main-dark">
            {!!header && (
              <Link href={'#'} className="text-lg">
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
          <div className="absolute z-[1] top-3 right-0 translate-x-full flex gap-3 group-hover/item:translate-x-[-12px] transition-all">
            <Link
              href={'#'}
              className="w-[30px] h-[30px] flex items-center justify-center rounded-btn-border border-2 border-main bg-dark-light bg-opacity-90 rotate-180 group-hover/item:rotate-0 transition-all"
            >
              ℹ
            </Link>
            <Link
              href={'#'}
              className="w-[30px] h-[30px] flex items-center justify-center rounded-btn-border border-2 border-main bg-dark-light bg-opacity-90 rotate-180 group-hover/item:rotate-0 transition-all"
            >
              ✩
            </Link>
          </div>

          <div
            className="absolute left-0 top-0 w-full transition-all duration-500 h-full opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible"
            style={{ backdropFilter: 'blur(1px)', filter: `grayscale(1)` }}
          ></div>

          {/* НАЗВАНИЕ ИГРЫ ИНФА И КНОПКА ПРИ ХОВЕРЕ */}
          <div className="absolute bottom-0 translate-y-[100%] group-hover/item:translate-y-[0] left-0 px-3 py-3 bg-main-dark bg-opacity-90 rounded-b w-full text-white transition-all">
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
            <div className="absolute bottom-[-50px] border-2 border-main right-3 w-[50px] h-[50px] rounded bg-dark-light bg-opacity-90 group-hover/item:bottom-[calc(100%-25px)] transition-all delay-75">
              <Link
                href={'#'}
                className="h-full w-full flex items-center justify-center"
              >
                <svg
                  width="25"
                  height="25"
                  viewBox="0 0 57 42"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M32.1383 33.0754L32.1375 42L57 21L32.1375 -3.04042e-06L32.1375 8.92463L-1.9801e-06 8.93225L-9.24771e-07 33.0754L32.1383 33.0754Z"
                    className="fill-main"
                  />
                </svg>
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
