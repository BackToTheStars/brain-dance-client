import { fontSettings } from '@/config/lobby/fonts';
import { ArrowRightOutlined, InfoCircleOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { openSliderModal } from '../../redux/actions';
import { SLIDER_MODAL_TURN } from '@/config/lobby/sliderModal';

const getVideoImg = (url) => {
  if (url.match(/^(http[s]?:\/\/|)(www.|)youtu(.be|be.com)\//)) {
    const newVideoUrl = url.split('=')[1];
    return `https://img.youtube.com/vi/${newVideoUrl}/0.jpg`;
  } else {
    return '';
  }
};

const TurnCard = ({ turn }) => {
  const dispatch = useDispatch();
  const lineCount = useSelector((s) => s.lobby.textSettings.lineCount);
  const dictionaryGames = useSelector((s) => s.lobby.dGames);
  const gamesTitle = dictionaryGames[turn.gameId]?.name;
  const fontSize = useSelector((s) => s.lobby.textSettings.fontSize);
  const lineSpacing = useSelector((s) => s.lobby.textSettings.lineSpacing);
  const alignment = useSelector((s) => s.lobby.textSettings.alignment);
  const cardPadding = useSelector((s) => s.lobby.textSettings.padding);
  const activeFontFamily = useSelector(
    (s) => s.lobby.textSettings.activeFontFamily
  );
  const limitLineHeader = useSelector(
    (s) => s.lobby.textSettings.limitLineHeader
  );
  const fontFamily = fontSettings[activeFontFamily];
  const { header, imageUrl, videoUrl, paragraph, date, contentType } = turn;
  const text = (paragraph && paragraph[0]?.insert) || null;
  const videoImg = getVideoImg(videoUrl || '');
  const newDate = new Date(date);

  const limitLine = () => {
    return {
      WebkitLineClamp: `${limitLineHeader}`,
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
        className={`relative w-full group/item overflow-hidden rounded dark:bg-dark-light bg-light`}
        style={{ maxHeight: `${maxHeight}px`, minHeight: `${minHeight}px` }}
      >
        {contentType !== 'comment' && (
          <div
            className={`bg-main-dark`}
            style={{
              fontFamily: `var(--${fontFamily.className})`,
              padding: `${cardPadding}px`,
            }}
          >
            {!!header && (
              <Link
                href={'#'}
                className="text-lg"
                style={{
                  ...limitLine(),
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
        <div
          className="dark:bg-dark-light bg-light flex flex-col gap-y-4"
          style={{ padding: `${cardPadding}px` }}
        >
          {!!imageUrl && (
            <img src={imageUrl} alt="#" className={`w-full h-auto rounded`} />
          )}
          {!!videoImg && <img src={videoImg} />}
          {!!text && (
            <div
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: `${lineSpacing}`,
                textAlign: alignment,
              }}
            >
              <p
                className={`dark:text-white text-dark ${fontFamily.className}`}
                style={{ fontFamily: `var(--${fontFamily.className})` }}
              >
                {text}
              </p>
            </div>
          )}

          {/* ДОП КНОПКИ появляются сверху при ховере (Если не нужны можно удалить) */}

          <div
            className="absolute left-0 top-0 w-full transition-all duration-500 h-full opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible"
            style={{ backdropFilter: 'blur(1px)', filter: `grayscale(1)` }}
          ></div>

          {/* НАЗВАНИЕ ИГРЫ ИНФА И КНОПКА ПРИ ХОВЕРЕ */}
          <div
            className="absolute bottom-0 translate-y-[100%] group-hover/item:translate-y-[0] left-0 bg-main-dark bg-opacity-90 rounded-b w-full text-white transition-all"
            style={{
              maxHeight: `calc(100% - 45px)`,
              padding: `${cardPadding}px`,
            }}
          >
            {!!gamesTitle ? (
              <h4 className="pe-[70px] mb-1">
                <Link href={'#'} className="font-bold text-lg">
                  Игра: {gamesTitle}
                </Link>
              </h4>
            ) : (
              <h4 className="pe-[70px] mb-1">Нет тайтла</h4>
            )}
            <p
              className={`mb-0 text-sm ${fontFamily.className}`}
              style={{ textAlign: alignment }}
            >
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Totam,
              asperiores!
            </p>

            {/* КНОПКА (ПЕРЕХОД В САМУ ИГРУ)  */}

            <div className="absolute z-[1] top-[-15px] right-0 translate-x-full flex group-hover/item:translate-x-[-5px] transition-all py-[6px] px-3 rounded-btn-border dark:bg-dark-light bg-light border border-main">
              <div
                className="h-[16px] flex items-center justify-center pe-3 border-r border-main cursor-pointer"
                onClick={() => {
                  dispatch(
                    openSliderModal(SLIDER_MODAL_TURN, {
                      header,
                      imageUrl,
                      videoUrl,
                      paragraph,
                      date,
                      contentType,
                      width: '50%',
                    })
                  );
                }}
              >
                <InfoCircleOutlined className="dark:text-white text-dark" />
              </div>
              <Link
                href={'#'}
                className="h-[16px] flex items-center justify-center ps-3"
              >
                <ArrowRightOutlined className="dark:text-white text-dark" />
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
