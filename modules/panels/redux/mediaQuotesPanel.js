import { PANEL_ADD_EDIT_TURN, PANEL_MEDIA_QUOTES } from '@/config/panel';
import { centerViewportAtPosition } from '@/modules/game/game-redux/actions';
import { getMediaQuotesPanelWidth } from '../helpers/editorPanel';
import { changePanelGeometry, togglePanel } from './actions';

// Панель правки цитат ленты: её параметры живут в её же записи state.panels.d, а не в общих
// editTurnId / mode — режимы цитат картинки и pdf не должны переключать открытую панель.
export const MEDIA_QUOTES_WIDGETS = { audio: 'aq_1', video: 'vq_1' };

const CLOSED = {
  editTurnId: null,
  widgetId: null,
  focus: null,
  dirty: false,
  closeRequest: null,
};

const panelOf = (state) => state.panels.d[PANEL_MEDIA_QUOTES];

export const closeMediaQuotesPanel = () => (dispatch, getState) => {
  if (!panelOf(getState())?.isDisplayed) return;
  dispatch(togglePanel({ type: PANEL_MEDIA_QUOTES, open: false }));
  dispatch(changePanelGeometry(PANEL_MEDIA_QUOTES, CLOSED));
};

// then — что сделать после закрытия; при несохранённых правках панель сначала спрашивает.
export const requestMediaQuotesClose = (then) => (dispatch, getState) => {
  const panel = panelOf(getState());
  if (!panel?.isDisplayed) return then?.();
  if (!panel.dirty) {
    dispatch(closeMediaQuotesPanel());
    return then?.();
  }
  dispatch(
    changePanelGeometry(PANEL_MEDIA_QUOTES, {
      closeRequest: { then: then || null },
    }),
  );
};

export const resolveMediaQuotesClose = (confirmed) => (dispatch, getState) => {
  const request = panelOf(getState())?.closeRequest;
  if (!confirmed) {
    dispatch(changePanelGeometry(PANEL_MEDIA_QUOTES, { closeRequest: null }));
    return;
  }
  dispatch(closeMediaQuotesPanel());
  request?.then?.();
};

export const openMediaQuotesPanel =
  ({ turnId, kind, quoteId = null }) =>
  (dispatch, getState) => {
    const widgetId = MEDIA_QUOTES_WIDGETS[kind];
    const state = getState();
    if (!widgetId || !state.turns.d[turnId]) return;
    if (state.panels.d[PANEL_ADD_EDIT_TURN]?.isDisplayed) return;
    const panel = panelOf(state);
    if (
      panel?.isDisplayed &&
      panel.editTurnId === turnId &&
      panel.widgetId === widgetId
    ) {
      if (quoteId !== null) {
        dispatch(
          changePanelGeometry(PANEL_MEDIA_QUOTES, {
            focus: { quoteId, seq: (panel.focus?.seq || 0) + 1 },
          }),
        );
      }
      return;
    }
    dispatch(
      requestMediaQuotesClose(() => {
        const now = getState();
        const geometry = now.turns.g[turnId];
        if (!geometry || !now.turns.d[turnId]) return;
        const width = getMediaQuotesPanelWidth(now);
        dispatch(
          changePanelGeometry(PANEL_MEDIA_QUOTES, {
            ...CLOSED,
            editTurnId: turnId,
            widgetId,
            focus: quoteId === null ? null : { quoteId, seq: 0 },
          }),
        );
        dispatch(togglePanel({ type: PANEL_MEDIA_QUOTES, open: true }));
        // Как Edit хода: карточка встаёт в свободную область слева от панели (ширина — экранные px).
        dispatch(
          centerViewportAtPosition({
            x:
              geometry.position.x +
              Math.floor(geometry.size.width / 2) +
              Math.round(width / 2 / now.game.zoom),
            y: geometry.position.y + Math.floor(geometry.size.height / 2),
          }),
        );
      }),
    );
  };
