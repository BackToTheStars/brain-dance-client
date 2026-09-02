import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FragmentEditor from '../timeline/FragmentEditor';
import { getDefaultFragments } from '../../helpers/timeline/fragments';
import WidgetEditButton from '../buttons/Edit';
import { RULE_TURNS_CRUD } from '@/config/user';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { processQuoteClicked } from '@/modules/quotes/redux/actions';
import { linesDelete, quoteCoordsUpdate } from '@/modules/lines/redux/actions';

const TIMELINE_HEIGHT = 82;
const ACTIVE_QUOTE_HEIGHT = 50;
const INACTIVE_QUOTE_HEIGHT = 25;

const TimelineQuotes = ({
  turnId,
  widgetId,
  registerHandleResize,
  unregisterHandleResize,
  progress = 0,
  playing,
  togglePlay,
  updateQuotesWidget,
  widgetType,
  quoteType,
  managePanelMode,
}) => {
  const wrapperEl = useRef(null);
  const { width } = useSelector((state) => state.turns.g[turnId].size);
  const { can } = useUserContext();
  const dispatch = useDispatch();
  const quotesWidget = useSelector(
    // videoQuotes or audioQuotes
    (state) => state.turns.d[turnId].dWidgets[widgetId],
  );
  const turn = useSelector((state) => state.turns.d[turnId]);
  const [widgetMode, setWidgetMode] = useState('view');
  const { duration, quotes } = quotesWidget;
  const [fragments, setFragments] = useState(getDefaultFragments(duration));
  const dLines = useSelector((store) => store.lines.dByTurnIdAndMarker[turnId]);

  const dQuotesWithLines = useMemo(() => {
    if (!dLines) return {};
    const d = {};
    for (const quote of quotes) {
      if (dLines[quote.id]) {
        d[quote.id] = true; // @todo: check turnId
      }
    }
    return d;
  }, [dLines, quotes]);
  const handleFragmentsChange = (updatedFragments) => {
    // setFragments(updatedFragments);
    // Дополнительная логика при изменении фрагментов (если требуется)
    let end = 0;
    const quotes = [];
    if (updatedFragments[0].start !== 0) {
      console.log(updatedFragments);
      throw new Error('First quote should start from 0');
    }
    if (updatedFragments.at(-1).end !== duration) {
      console.log(updatedFragments);
      throw new Error('Last quote should end at duration');
    }
    for (const fragment of updatedFragments) {
      if (fragment.start !== end) {
        console.log(updatedFragments);
        throw new Error('');
      }
      end = fragment.end;
      quotes.push({
        id: fragment.id,
        start: fragment.start,
        text: fragment.text,
        active: fragment.active,
      });
    }

    dispatch(
      updateQuotesWidget(turnId, widgetId, {
        ...quotesWidget,
        quotes,
      }),
    );
  };

  const height = useMemo(() => {
    // return Math.max(75 + 50 * fragments.length, 150);
    if (widgetMode === 'edit') {
      const quotesHeight = fragments.reduce((acc, fragment) => {
        return (
          acc + (fragment.active ? ACTIVE_QUOTE_HEIGHT : INACTIVE_QUOTE_HEIGHT)
        );
      }, 0);
      return quotesHeight + INACTIVE_QUOTE_HEIGHT + TIMELINE_HEIGHT + 5; // 5 - запас
    } else {
      // 'view'
      const quotesHeight = fragments.reduce((acc, fragment) => {
        return (
          acc + (fragment.active ? ACTIVE_QUOTE_HEIGHT : INACTIVE_QUOTE_HEIGHT)
        );
      }, 0);
      return quotesHeight + INACTIVE_QUOTE_HEIGHT + 5; // 5 - запас
    }
  }, [widgetMode, fragments]);

  const toggleQuoteClicked = (quoteId) => {
    dispatch(processQuoteClicked(`${turnId}_${quoteId}`, can));
  };

  useEffect(() => {
    registerHandleResize({
      type: widgetType,
      id: widgetId,
      minWidthCallback: () => {
        return 20;
      },
      minHeightCallback: (newWidth) => {
        return height;
      },
      maxHeightCallback: (newWidth) => {
        return height;
      },
    });
    return () => unregisterHandleResize({ id: widgetId });
  }, [height]);

  useEffect(() => {
    if (!wrapperEl?.current) return;
    const checkQuotes = () => {
      const rect = wrapperEl?.current.getBoundingClientRect();
      const turnEl = wrapperEl?.current.closest('.stb-react-turn');
      const widgetTop = rect.top - turnEl.getBoundingClientRect().top;
      let width = Math.round(rect.width);
      let height = Math.round(rect.height);
      if (!width || !height) return;
      if (!quotes.length) return;
      const extraTop =
        widgetTop + (widgetMode === 'view' ? 0 : TIMELINE_HEIGHT + 15) + 25;
      let accTop =
        extraTop -
        (quotes[0].active ? ACTIVE_QUOTE_HEIGHT : INACTIVE_QUOTE_HEIGHT);
      dispatch(
        quoteCoordsUpdate(
          turnId,
          widgetId,
          quotes.map((quote, i) => {
            const delta = quote.active
              ? ACTIVE_QUOTE_HEIGHT
              : INACTIVE_QUOTE_HEIGHT;
            return {
              type: quoteType,
              initialCoords: {},
              quoteId: quote.id,
              quoteKey: `${turnId}_${quote.id}`,
              turnId,
              text: quote.text,
              left: 37,
              top: (accTop += delta), //extraTop + widgetTop + 2 * i * INACTIVE_QUOTE_HEIGHT,
              width: width - 60,
              height: INACTIVE_QUOTE_HEIGHT,
              // left:
              //   Math.round((width * quote.x) / 100) +
              //   (pictureOnly ? 0 : widgetSpacer),
              // top:
              //   Math.round((height * quote.y) / 100) +
              //   (pictureOnly ? 0 : widgetSpacer) +
              //   2 +
              //   widgetTop,
              // width: Math.round((width * quote.width) / 100),
              // height: Math.round((height * quote.height) / 100),
            };
          }),
        ),
      );
    };
    checkQuotes();
    let timeout = setTimeout(() => checkQuotes(), 500);
    return () => clearTimeout(timeout);
  }, [quotes, wrapperEl, width, height, widgetMode]);

  useEffect(() => {
    const fragments = [];
    for (let i = 0; i < quotes.length; i++) {
      fragments.push({
        id: quotes[i].id,
        start: quotes[i].start,
        end: quotes[i + 1] ? quotes[i + 1].start : duration,
        text: quotes[i].text,
        active: quotes[i].active,
      });
    }
    setFragments(fragments);
  }, [quotes, duration]);

  return (
    <div
      ref={wrapperEl}
      className="timeline-quotes turn-widget relative not-draggable cursor-auto"
      style={{
        height: `${height}px`,
      }}
    >
      <FragmentEditor
        widgetMode={widgetMode}
        progress={progress}
        playing={playing}
        togglePlay={togglePlay}
        duration={duration}
        turnId={turnId}
        existingFragments={fragments}
        onFragmentsChange={handleFragmentsChange}
        onFragmentDelete={(id) => {
          const linesToDelete = dLines[id] || [];
          if (linesToDelete.length) {
            dispatch(linesDelete(linesToDelete.map((l) => l._id)));
          }
        }}
        toggleQuoteClicked={toggleQuoteClicked}
        dQuotesWithLines={dQuotesWithLines}
      />
      {can(RULE_TURNS_CRUD) && (
        <WidgetEditButton
          turnId={turnId}
          widgetId={widgetId}
          mode={managePanelMode}
          additionalCallback={() =>
            setWidgetMode(widgetMode === 'view' ? 'edit' : 'view')
          }
        />
      )}
    </div>
  );
};

export default TimelineQuotes;
