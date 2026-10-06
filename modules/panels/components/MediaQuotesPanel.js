'use client';
import { memo, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { Input, Modal, Slider, Tooltip } from 'antd';
import { AimOutlined } from '@ant-design/icons';
import { FiPause, FiPlay, FiTrash2, FiX } from 'react-icons/fi';
import { useTranslations } from 'next-intl';
import { PANEL_MEDIA_QUOTES } from '@/config/panel';
import { RULE_TURNS_CRUD } from '@/config/user';
import { TID } from '@/config/testIds';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { selectFollowing } from '@/modules/presence/redux/selectors';
import { usePlaybackChannel } from '@/modules/turns/components/widgets/media/PlaybackContext';
import QuotePlayButton from '@/modules/turns/components/widgets/media/QuotePlayButton';
import { getFormattedDuration } from '@/modules/turns/components/helpers/formatters/player';
import {
  checkQuotes,
  newQuoteId,
  quotesFromSegments,
  turnQuoteIds,
} from '@/modules/turns/components/helpers/timeline/quotes';
import {
  addQuoteAt,
  addQuoteReason,
  lostLinks,
  parseTime,
  quotesForSave,
  removeQuote,
  sameQuotes,
  setQuoteDuration,
  setQuoteEnd,
  setQuoteRange,
  setQuoteStart,
} from '@/modules/turns/components/helpers/timeline/edit';
import { saveMediaQuotes } from '@/modules/turns/redux/mediaQuotes';
import { changePanelGeometry } from '../redux/actions';
import { MediaQuotesPanelSplit } from './EditorPanelSplit';
import {
  closeMediaQuotesPanel,
  requestMediaQuotesClose,
  resolveMediaQuotesClose,
} from '../redux/mediaQuotesPanel';

const KINDS = {
  aq_1: { kind: 'audio', playerId: 'a_1', name: 'Audio' },
  vq_1: { kind: 'video', playerId: 'v_1', name: 'Video' },
};

const PLAYER_HINTS = {
  offscreen: 'The card is off screen: bring it into view to use the player.',
  preview: 'Turn on the video in the card to use the player.',
  waiting: 'The player is not ready yet.',
};

const ADD_HINTS = {
  player: 'The player is not available',
  'no-duration': 'The file duration is not known yet',
  'inside-quote': 'The current position is inside a quote',
  'no-room': 'Less than 1 s left before the next quote',
};

const NOTES = {
  clamped: 'Adjusted: quotes do not overlap and last at least 1 s.',
  'duplicate-id': 'Duplicate quote id.',
  'not-whole-seconds': 'Whole seconds only.',
  'out-of-range': 'The quote is outside the file.',
  'too-short': 'A quote lasts at least 1 s.',
  overlap: 'The quote overlaps the previous one.',
};

const FORMAT_ERROR = 'Use m:ss, h:mm:ss or seconds';

const fmt = getFormattedDuration;
const percent = (value, total) =>
  `${Math.min(Math.max(value / total, 0), 1) * 100}%`;
const sameId = (a, b) => String(a) === String(b);

const Marker = () => (
  <svg viewBox="0 0 10 9" width="10" height="9" aria-hidden="true">
    <path d="M5 0 10 9H0Z" fill="currentColor" />
  </svg>
);

const RANGE_LABEL_STYLES = { root: { pointerEvents: 'none' } };

const RangeLabel = ({ value, max, placement, open, testId }) => {
  const tooltip = useRef(null);

  // якорь едет за ручкой без смены размера — antd сам подпись не перемещает
  useEffect(() => {
    if (!open) return undefined;
    const frame = requestAnimationFrame(() => tooltip.current?.forceAlign());
    return () => cancelAnimationFrame(frame);
  }, [open, value, max]);

  return (
    <Tooltip
      ref={tooltip}
      open={open}
      placement={placement}
      styles={RANGE_LABEL_STYLES}
      title={<span data-test-id={testId}>{fmt(value)}</span>}
    >
      <span
        className="media-quotes__range-anchor"
        style={{ left: percent(value, max) }}
      />
    </Tooltip>
  );
};

// У antd одна подсказка на обе ручки и только сверху, поэтому свои: начало слева, конец справа.
const QuoteRange = ({ quote, max, hint, onChange }) => {
  const [hover, setHover] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [keyFocus, setKeyFocus] = useState(false);
  const open = hover || dragging || keyFocus;

  return (
    <div
      className="media-quotes__range"
      data-test-id={TID.mediaQuotes.range}
      data-quote-id={quote ? quote.id : ''}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={(e) => setKeyFocus(e.target.matches(':focus-visible'))}
      onBlur={() => setKeyFocus(false)}
    >
      {quote ? (
        <div className="media-quotes__slider">
          <Slider
            range
            min={0}
            max={max}
            step={1}
            allowCross={false}
            value={[quote.start, quote.end]}
            onChange={(values) => {
              setDragging(true);
              onChange(values);
            }}
            onChangeComplete={() => setDragging(false)}
            tooltip={{ open: false }}
          />
          <RangeLabel
            value={quote.start}
            max={max}
            placement="left"
            open={open}
            testId={TID.mediaQuotes.rangeStart}
          />
          <RangeLabel
            value={quote.end}
            max={max}
            placement="right"
            open={open}
            testId={TID.mediaQuotes.rangeEnd}
          />
        </div>
      ) : (
        <span className="media-quotes__hint">{hint}</span>
      )}
    </div>
  );
};

// Применяется по уходу из поля и по Enter; onApply возвращает применённое значение.
const TimeField = ({
  label,
  value,
  field,
  testId,
  onApply,
  nowTestId,
  nowTitle,
  nowPlacement,
  nowDisabled,
  onNow,
}) => {
  const shown = fmt(value);
  const [text, setText] = useState(shown);
  const [error, setError] = useState(false);
  const editing = useRef(false);

  useEffect(() => {
    if (editing.current) return;
    setText(shown);
    setError(false);
  }, [shown]);

  const apply = () => {
    editing.current = false;
    const typed = text.trim();
    if (typed === shown) {
      setText(shown);
      setError(false);
      return;
    }
    const seconds = parseTime(typed);
    if (seconds === null) {
      setError(true);
      return;
    }
    setError(false);
    const applied = onApply(seconds);
    setText(fmt(applied ?? value));
  };

  return (
    <span className="media-quotes-field">
      <span className="media-quotes-field__line">
        <span className="media-quotes-field__label">{label}</span>
        <Input
          size="small"
          className="media-quotes-field__input"
          value={text}
          status={error ? 'error' : ''}
          data-test-id={testId}
          onFocus={() => {
            editing.current = true;
          }}
          onChange={(e) => setText(e.target.value)}
          onBlur={apply}
          onPressEnter={(e) => e.currentTarget.blur()}
        />
        <Tooltip title={nowTitle} placement={nowPlacement}>
          <button
            type="button"
            className="media-quotes-icon media-quotes-field__now"
            data-test-id={nowTestId}
            disabled={nowDisabled}
            onClick={onNow}
          >
            <AimOutlined />
          </button>
        </Tooltip>
      </span>
      {error && (
        <span
          className="media-quotes-error"
          data-test-id={TID.mediaQuotes.fieldError}
          data-field={field}
          data-code="format"
        >
          {FORMAT_ERROR}
        </span>
      )}
    </span>
  );
};

const QuoteRow = ({
  quote,
  index,
  selected,
  note,
  playerReady,
  play,
  rowRef,
  onSelect,
  onText,
  onStart,
  onDuration,
  onStartNow,
  onEndNow,
  onRemove,
}) => {
  const { id } = quote;
  return (
    <div
      ref={rowRef}
      className="media-quotes-row"
      data-test-id={TID.mediaQuotes.row}
      data-quote-id={id}
      data-selected={selected ? 'true' : 'false'}
      data-start={quote.start}
      data-end={quote.end}
      onClick={() => onSelect(id)}
    >
      <div className="media-quotes-row__line">
        <Tooltip title="Select the quote" placement="left">
          <button
            type="button"
            className="media-quotes-row__select"
            data-test-id={TID.mediaQuotes.select}
            aria-pressed={selected}
          >
            <Marker />
          </button>
        </Tooltip>
        <Input.TextArea
          className="media-quotes-row__text"
          data-test-id={TID.mediaQuotes.text}
          autoSize={{ minRows: 1 }}
          value={quote.text}
          placeholder={`Quote ${index + 1}`}
          onFocus={() => onSelect(id)}
          onChange={(e) => onText(id, e.target.value.replace(/[\r\n]+/g, ' '))}
        />
      </div>
      <div className="media-quotes-row__line media-quotes-row__times">
        <TimeField
          label="Start"
          field="start"
          value={quote.start}
          testId={TID.mediaQuotes.start}
          onApply={(seconds) => onStart(id, seconds)}
          nowTestId={TID.mediaQuotes.startNow}
          nowTitle="Start at the current position"
          nowPlacement="left"
          nowDisabled={!playerReady}
          onNow={() => onStartNow(id)}
        />
        <TimeField
          label="Duration"
          field="duration"
          value={quote.end - quote.start}
          testId={TID.mediaQuotes.duration}
          onApply={(seconds) => onDuration(id, seconds)}
          nowTestId={TID.mediaQuotes.durationNow}
          nowTitle="End at the current position"
          nowPlacement="right"
          nowDisabled={!playerReady}
          onNow={() => onEndNow(id)}
        />
        <QuotePlayButton
          turnId={play.turnId}
          playerId={play.playerId}
          quote={quote}
          className="media-quotes-icon media-quotes-row__play"
          testId={TID.mediaQuotes.rowPlay}
          disabled={play.disabled}
          tooltipPlacement="right"
        />
        <Tooltip title="Delete the quote" placement="right">
          <button
            type="button"
            className="media-quotes-icon media-quotes-row__remove"
            data-test-id={TID.mediaQuotes.remove}
            onClick={(e) => {
              e.stopPropagation();
              onRemove(id);
            }}
          >
            <FiTrash2 />
          </button>
        </Tooltip>
      </div>
      {!!note && (
        <div
          className={`media-quotes-error${note === 'clamped' ? ' media-quotes-error_note' : ''}`}
          data-test-id={TID.mediaQuotes.fieldError}
          data-field="quote"
          data-code={note}
        >
          {NOTES[note] || note}
        </div>
      )}
    </div>
  );
};

const MediaQuotesEditor = ({ turnId, widgetId }) => {
  const { kind, playerId, name } = KINDS[widgetId];
  const t = useTranslations('Game.mediaQuotes');
  const dispatch = useDispatch();
  const store = useStore();
  const { can } = useUserContext();
  const following = useSelector(selectFollowing);
  const canEdit = can(RULE_TURNS_CRUD) && !following;
  const title = useSelector(
    (s) => s.turns.d[turnId]?.dWidgets?.h_1?.text || '',
  );
  const focus = useSelector((s) => s.panels.d[PANEL_MEDIA_QUOTES].focus);
  const closeRequest = useSelector(
    (s) => s.panels.d[PANEL_MEDIA_QUOTES].closeRequest,
  );
  const player = usePlaybackChannel(turnId, playerId);

  // Лента на момент открытия: с ней сравнивается черновик; запись в стор при открытой панели его не сбрасывает.
  const [{ original, savedDuration }] = useState(() => {
    const widget = store.getState().turns.d[turnId].dWidgets[widgetId];
    return {
      original: quotesFromSegments(widget.quotes, widget.duration),
      savedDuration: widget.duration || 0,
    };
  });
  const [draft, setDraft] = useState(original);
  const draftRef = useRef(draft);
  const [selectedId, setSelectedId] = useState(focus?.quoteId ?? null);
  const [notes, setNotes] = useState({});
  const [lostConfirm, setLostConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const rowsRef = useRef({});

  // Длительность из плеера помнится и после ухода карточки с экрана.
  const playerDuration = useRef(0);
  if (player.available && player.duration > 0) {
    playerDuration.current = player.duration;
  }
  const total = playerDuration.current || savedDuration;

  let playerState = 'ready';
  if (!player.mounted) playerState = 'offscreen';
  else if (!player.available) playerState = kind === 'video' ? 'preview' : 'waiting';
  const ready = playerState === 'ready';
  // ▷ цитаты сам включает видео из превью; без карточки и без готового аудио — нечем играть.
  const play = {
    turnId,
    playerId,
    disabled: !(ready || playerState === 'preview'),
  };
  const progress = ready ? player.progress : 0;
  const dirty = !sameQuotes(original, draft);
  const selected = draft.find((quote) => sameId(quote.id, selectedId)) || null;
  const addReason = ready ? addQuoteReason(draft, progress, total) : 'player';

  useEffect(() => {
    dispatch(changePanelGeometry(PANEL_MEDIA_QUOTES, { dirty }));
  }, [dirty]);

  useEffect(() => {
    if (!canEdit) dispatch(closeMediaQuotesPanel());
  }, [canEdit]);

  useEffect(() => {
    if (!focus) return;
    setSelectedId(focus.quoteId);
    rowsRef.current[focus.quoteId]?.scrollIntoView({ block: 'nearest' });
  }, [focus?.seq, focus?.quoteId]);

  const commitDraft = (next) => {
    draftRef.current = next;
    setDraft(next);
    setSaveError(null);
  };

  const applyEdit = (id, result) => {
    commitDraft(result.quotes);
    setNotes((prev) => ({ ...prev, [id]: result.clamped ? 'clamped' : null }));
    return result.value;
  };

  const handlers = {
    onSelect: setSelectedId,
    onText: (id, text) =>
      commitDraft(
        draftRef.current.map((quote) =>
          sameId(quote.id, id) ? { ...quote, text } : quote,
        ),
      ),
    onStart: (id, seconds) =>
      applyEdit(id, setQuoteStart(draftRef.current, id, seconds, total)),
    onDuration: (id, seconds) => {
      const result = setQuoteDuration(draftRef.current, id, seconds, total);
      applyEdit(id, result);
      const quote = result.quotes.find((q) => sameId(q.id, id));
      return quote ? quote.end - quote.start : null;
    },
    onStartNow: (id) => {
      setSelectedId(id);
      applyEdit(id, setQuoteStart(draftRef.current, id, player.progress, total));
    },
    onEndNow: (id) => {
      setSelectedId(id);
      applyEdit(id, setQuoteEnd(draftRef.current, id, player.progress, total));
    },
    onRemove: (id) => {
      commitDraft(removeQuote(draftRef.current, id));
      setNotes((prev) => ({ ...prev, [id]: null }));
      if (sameId(selectedId, id)) setSelectedId(null);
    },
  };

  const addQuote = () => {
    const state = store.getState();
    const lineMarkers = Object.keys(state.lines.dByTurnIdAndMarker[turnId] || {});
    const takenIds = [
      ...turnQuoteIds(state.turns.d[turnId], lineMarkers),
      ...draftRef.current.map((quote) => quote.id),
    ];
    const result = addQuoteAt(
      draftRef.current,
      player.progress,
      total,
      newQuoteId(takenIds, Date.now()),
    );
    if (!result.quote) return;
    commitDraft(result.quotes);
    setSelectedId(result.quote.id);
  };

  const onRange = (values) => {
    if (!selected) return;
    applyEdit(
      selected.id,
      setQuoteRange(draftRef.current, selected.id, values, total),
    );
  };

  const seekAt = (e) => {
    if (!ready || !(total > 0)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    player.seek(((e.clientX - rect.left) / rect.width) * total);
  };

  const commit = (quotes) => {
    setSaving(true);
    setSaveError(null);
    dispatch(
      saveMediaQuotes({ turnId, kind, quotes, duration: playerDuration.current }),
    )
      .then(() => {
        const panel = store.getState().panels.d[PANEL_MEDIA_QUOTES];
        if (
          panel.isDisplayed &&
          panel.editTurnId === turnId &&
          panel.widgetId === widgetId
        ) {
          dispatch(closeMediaQuotesPanel());
        }
      })
      .catch((error) => {
        setSaving(false);
        if (error?.problems) {
          setNotes(Object.fromEntries(error.problems.map((p) => [p.id, p.code])));
        } else {
          setSaveError('Could not save the quotes.');
        }
      });
  };

  const save = () => {
    if (saving || !dirty) return;
    const quotes = quotesForSave(draftRef.current, total, savedDuration);
    const problems = checkQuotes(quotes, total);
    if (problems.length) {
      setNotes(Object.fromEntries(problems.map((p) => [p.id, p.code])));
      return;
    }
    const lost = lostLinks(
      original,
      quotes,
      store.getState().lines.dByTurnIdAndMarker[turnId],
    );
    if (lost.quotesCount) {
      setLostConfirm({ quotes, lost });
      return;
    }
    commit(quotes);
  };

  const cancel = () => dispatch(requestMediaQuotesClose());

  return (
    <div
      className="media-quotes"
      data-test-id={TID.mediaQuotes.root}
      data-turn-id={turnId}
      data-kind={kind}
      data-dirty={dirty ? 'true' : 'false'}
      data-player={playerState}
    >
      <div className="media-quotes__head">
        <span className="media-quotes__title" title={title}>
          Quotes: {title || name}
        </span>
        <button
          type="button"
          className="media-quotes-icon"
          data-test-id={TID.mediaQuotes.close}
          title="Close"
          onClick={cancel}
        >
          <FiX />
        </button>
      </div>

      <div className="media-quotes__player">
        <button
          type="button"
          className="media-quotes-icon"
          data-test-id={TID.mediaQuotes.play}
          data-playing={player.playing ? 'true' : 'false'}
          disabled={!ready}
          title={
            ready ? (player.playing ? 'Pause' : 'Play') : PLAYER_HINTS[playerState]
          }
          onClick={player.togglePlay}
        >
          {player.playing ? <FiPause /> : <FiPlay />}
        </button>
        <span className="media-quotes__time" data-test-id={TID.mediaQuotes.time}>
          {ready ? fmt(progress) : '–:––'} / {fmt(total)}
        </span>
        {!ready && (
          <span
            className="media-quotes__hint"
            data-test-id={TID.mediaQuotes.playerHint}
          >
            {PLAYER_HINTS[playerState]}
          </span>
        )}
      </div>

      <div
        className="media-quotes__track"
        data-test-id={TID.mediaQuotes.track}
        data-disabled={ready ? 'false' : 'true'}
        onClick={seekAt}
      >
        {total > 0 &&
          draft.map((quote) => (
            <div
              key={quote.id}
              className="media-quotes__track-quote"
              data-test-id={TID.mediaQuotes.trackQuote}
              data-quote-id={quote.id}
              data-selected={selected?.id === quote.id ? 'true' : 'false'}
              style={{
                left: percent(quote.start, total),
                width: percent(quote.end - quote.start, total),
              }}
            />
          ))}
        {ready && total > 0 && (
          <div
            className="media-quotes__playhead"
            data-test-id={TID.mediaQuotes.playhead}
            style={{ left: percent(progress, total) }}
          />
        )}
      </div>

      <QuoteRange
        quote={selected}
        max={Math.max(Math.ceil(total), 1)}
        hint={draft.length ? 'Select a quote to move its boundaries here.' : ''}
        onChange={onRange}
      />

      <div className="media-quotes__list">
        {draft.map((quote, index) => (
          <QuoteRow
            key={quote.id}
            quote={quote}
            index={index}
            selected={selected?.id === quote.id}
            note={notes[quote.id]}
            playerReady={ready}
            play={play}
            rowRef={(el) => {
              rowsRef.current[quote.id] = el;
            }}
            {...handlers}
          />
        ))}
        {!draft.length && (
          <div className="media-quotes__hint media-quotes__empty">
            No quotes yet: play the file and press «+ Quote from current position».
          </div>
        )}
      </div>

      <div className="media-quotes__actions">
        <button
          type="button"
          className="btn btn-primary media-quotes__add"
          data-test-id={TID.mediaQuotes.add}
          data-reason={addReason || ''}
          disabled={!!addReason}
          title={
            addReason ? ADD_HINTS[addReason] : 'Start a quote at the current position'
          }
          onClick={addQuote}
        >
          + Quote from current position
        </button>
        {!!addReason && addReason !== 'player' && (
          <span className="media-quotes__hint">{ADD_HINTS[addReason]}</span>
        )}
        <div className="flex-1" />
        {!!saveError && (
          <span
            className="media-quotes-error"
            data-test-id={TID.mediaQuotes.saveError}
          >
            {saveError}
          </span>
        )}
        <button
          type="button"
          className="btn btn-primary"
          data-test-id={TID.mediaQuotes.cancel}
          onClick={cancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary btn-accent"
          data-test-id={TID.mediaQuotes.save}
          disabled={!dirty || saving}
          title={dirty ? undefined : 'Nothing to save: no changes'}
          onClick={save}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      <Modal
        open={!!lostConfirm}
        title={t('lostLinks.Title')}
        okText={t('lostLinks.Ok')}
        cancelText={t('lostLinks.Cancel')}
        okButtonProps={{
          danger: true,
          'data-test-id': TID.mediaQuotes.lostLinksSave,
        }}
        cancelButtonProps={{ 'data-test-id': TID.mediaQuotes.lostLinksCancel }}
        onCancel={() => setLostConfirm(null)}
        onOk={() => {
          const { quotes } = lostConfirm;
          setLostConfirm(null);
          commit(quotes);
        }}
      >
        {!!lostConfirm && (
          <div
            data-test-id={TID.mediaQuotes.lostLinks}
            data-quotes={lostConfirm.lost.quotesCount}
            data-links={lostConfirm.lost.linesCount}
          >
            <p>{t('lostLinks.Text')}</p>
            <p className="mb-0">
              {t.rich('lostLinks.Count', {
                quotes: lostConfirm.lost.quotesCount,
                links: lostConfirm.lost.linesCount,
                b: (chunks) => <b>{chunks}</b>,
              })}
            </p>
          </div>
        )}
      </Modal>

      <Modal
        open={!!closeRequest}
        title={t('discard.Title')}
        okText={t('discard.Ok')}
        cancelText={t('discard.Cancel')}
        okButtonProps={{
          danger: true,
          'data-test-id': TID.mediaQuotes.discardOk,
        }}
        cancelButtonProps={{ 'data-test-id': TID.mediaQuotes.discardCancel }}
        onCancel={() => dispatch(resolveMediaQuotesClose(false))}
        onOk={() => dispatch(resolveMediaQuotesClose(true))}
      >
        <p className="mb-0" data-test-id={TID.mediaQuotes.discard}>
          {t('discard.Text')}
        </p>
      </Modal>
    </div>
  );
};

// Ход удалён, игра сменилась или ленты нет — панели не на что смотреть.
const MediaQuotesPanel = () => {
  const dispatch = useDispatch();
  const turnId = useSelector((s) => s.panels.d[PANEL_MEDIA_QUOTES].editTurnId);
  const widgetId = useSelector((s) => s.panels.d[PANEL_MEDIA_QUOTES].widgetId);
  const exists = useSelector(
    (s) => !!KINDS[widgetId] && !!s.turns.d[turnId]?.dWidgets?.[widgetId],
  );

  useEffect(() => {
    if (!exists) dispatch(closeMediaQuotesPanel());
  }, [exists]);

  if (!exists) return null;
  return (
    <>
      <MediaQuotesPanelSplit />
      <MediaQuotesEditor
        key={`${turnId}_${widgetId}`}
        turnId={turnId}
        widgetId={widgetId}
      />
    </>
  );
};

export default memo(MediaQuotesPanel);
