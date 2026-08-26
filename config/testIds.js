// Единый источник правды для `data-test-id` — контракт между client и e2e-проектом.
// E2e-проект (Playwright) импортирует/копирует эту карту, как `config/user.js`
// дублируется в server. Конвенция и перечень узлов — в `client/docs/test-ids.md`.
//
// Правила: kebab-case; НЕ опираться на antd-классы/`nth-child`; где есть семантика —
// в тестах предпочитать getByRole/getByLabel, а testId использовать для неоднозначного
// и для canvas/SVG. Playwright настраивается на `testIdAttribute: 'data-test-id'`.

export const TID = {
  // Лобби: кнопки-триггеры и поля общей формы (LobbyForm)
  lobby: {
    createGameBtn: 'lobby-create-game',
    enterGameBtn: 'lobby-enter-game',
    field: (name) => `lobby-field-${name}`,
    radio: (name, value) => `lobby-radio-${name}-${value}`,
    submit: 'lobby-form-submit',
    cancel: 'lobby-form-cancel',
  },

  // Хост модалок: data-test-id={TID.modal(type)} (type из store.ui.modal)
  modal: (type) => `modal-${type}`,

  // Модалка подтверждения (да/нет)
  confirm: {
    ok: 'confirm-ok',
    cancel: 'confirm-cancel',
  },

  // Pre-game диалог выбора роли/ника (modules/lobby/components/page/GameDialog.js,
  // страница /game?hash=). Роль-опции antd Select берём через getByRole('option').
  gameDialog: {
    nickname: 'game-dialog-nickname',
    role: 'game-dialog-role',
    submit: 'game-dialog-submit',
  },

  // Диалог входа по коду из ссылки лобби
  // (modules/lobby/components/page/CodeEnterDialog.js, /game?hash=<код>, код ещё
  // не сохранён — спрашиваем только ник)
  codeHandoff: {
    nickname: 'code-handoff-nickname',
    submit: 'code-handoff-submit',
  },

  // Кнопки действий в игре (GameMode): add-turn, save-field, classes, info,
  // minimap, lobby, paste-turn
  gameAction: (name) => `game-action-${name}`,

  // Вход в игру по коду (per-game страница)
  codeEnter: {
    code: 'code-input',
    nickname: 'nickname-input',
    submit: 'code-submit',
  },

  // Холст и его содержимое
  canvas: 'canvas', // #game-box
  canvasLines: 'canvas-lines', // <svg id="lines">
  redLine: 'red-line', // отдельная логическая линия
  turnCard: 'turn-card', // карточка Turn (+ data-turn-id)
  quoteRect: 'quote-rect', // кликабельный прямоугольник цитаты (+ data-turn-id, data-quote-key)

  // Виджет PDF (ход contentType=pdf)
  pdf: {
    scroll: 'pdf-scroll', // скролл-контейнер документа (+ data-turn-id)
    page: 'pdf-page', // обёртка страницы (+ data-page-number)
    error: 'pdf-error', // сообщение об ошибке загрузки документа
    pageBar: 'pdf-page-bar', // индикатор активной страницы
    pageLabel: 'pdf-page-label', // «N / M»
    pagePrev: 'pdf-page-prev',
    pageNext: 'pdf-page-next',
    edit: 'pdf-edit', // кнопка входа в режим виджета (цитаты)
    crop: 'pdf-crop', // слой выделения области на активной странице
  },

  // Форма добавления/редактирования turn
  addTurn: {
    typeBtn: 'add-turn-type',
    typeOption: (name) => `add-turn-type-${name}`, // пункт дропдауна типа (picture/video/audio/comment)
    field: (name) => `add-turn-${name}`, // header, source, date, + поля FormInput (по prefixClass)
    // медиа-URL-инпуты используют field(prefixClass): image-url / video-url / audio-url
    save: 'add-turn-save',
  },
};

export default TID;
