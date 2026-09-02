// Единый источник правды для `data-test-id` — контракт между client и e2e-проектом.
// E2e-проект (Playwright) импортирует/копирует эту карту, как `config/user.js`
// дублируется в server. Конвенция и перечень узлов —
// в `../brain-platform/docs/services/client/test-ids.md`.
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
    crop: 'pdf-crop', // слой выделения области на активной странице
  },

  // Слой выделения области у картинки (widgets/picture/Crop.js): атрибут на <img>
  // внутри ReactCrop — сам ReactCrop чужие пропсы до DOM не доносит, а обёртка
  // меняла бы вёрстку; протяжка по картинке и есть выделение. Парно pdf.crop.
  pictureCrop: 'picture-crop',

  // Кнопки заголовка хода (widgets/header/ButtonsMenu.js): share, clone, edit,
  // cut, delete. Карточка несёт data-turn-id — тест целится через неё.
  turnAction: (name) => `turn-action-${name}`,

  // Кнопка правки виджета — карандаш в тулбаре любого виджета
  // (widgets/buttons/Edit.js), + data-turn-id, data-widget-id
  widgetEdit: 'widget-edit',

  // Кнопки режимов панели (modules/panels/components/buttons/<mode>/*.js), вешает
  // buttons/Buttons.js — как gameAction. Имена: add-area, save-area, modify, delete,
  // cancel, compress, uncompress, quotes-on, delete-quotes (перечень по режимам —
  // в brain-platform/docs/services/client/test-ids.md)
  panelAction: (name) => `panel-action-${name}`,

  // Панель линий активной цитаты (modules/panels/components/LinesPanel.js)
  linesPanel: {
    row: 'lines-panel-row', // строка таблицы (+ data-line-id)
    delete: 'lines-panel-delete', // кнопка Delete в строке (нативный confirm)
  },

  // Цитаты таймлайна (видео/аудио) и редактор фрагментов
  // (widgets/timeline/Fragments.js, FragmentEditor.js). Неактивные промежутки
  // между цитатами не размечены.
  timeline: {
    quote: 'timeline-quote', // фрагмент-цитата (+ data-turn-id, data-quote-id)
    quoteText: 'timeline-quote-text', // подпись цитаты — клик по ней активирует цитату
    field: (name) => `timeline-field-${name}`, // text (подпись), start, end (время чч:мм:сс)
    pointEdit: (name) => `timeline-point-${name}-edit`, // карандаш, открывающий поле start/end
    add: 'timeline-add', // «+»: новый фрагмент из текущего выделения
    play: 'timeline-play', // play/pause в редакторе (тот же togglePlay, что у плеера)
    edit: 'timeline-edit', // карандаш у фрагмента: правка подписи
    save: 'timeline-save', // «Ok» — сохранить подпись
    delete: 'timeline-delete', // корзина — удалить фрагмент (antd Popconfirm → «OK»)
  },

  // Дропзона загрузки файла (modules/turns/components/forms/FileUploading.js);
  // <input type=file> лежит внутри корня: `upload-dropzone input[type=file]`
  upload: {
    dropzone: 'upload-dropzone', // корень (+ data-upload-type: images|videos|audios|pdfs)
    error: 'upload-error',
    progress: 'upload-progress', // полоса отправки тела запроса
    processing: 'upload-processing', // тело ушло, media пишет файл
  },

  // Плееры (widgets/video/Media.js, widgets/audio/Audio.js). Слайдер прогресса
  // id не несёт: antd Slider (@rc-component/slider) чужие пропсы до DOM не доносит,
  // а обёртка меняла бы вёрстку — целиться в `.timeline-slider` внутри player.
  media: {
    player: 'media-player', // корень (+ data-turn-id, data-widget-id, data-playing="true|false")
    play: 'media-play', // play/pause
    preview: 'media-preview', // видео: значок на превью, по которому монтируется плеер (Video.js)
  },

  // Лобби: строка игры в списке (modules/lobby/components/ui/GameRow.js)
  lobbyGame: {
    row: 'lobby-game-row', // (+ data-game-hash)
    open: 'lobby-game-open', // «»» — сразу в игру
  },

  // Лобби: слайдер игры (modules/lobby/components/sliderModals/GameModal.js)
  gameModal: {
    open: 'game-modal-open',
    addCode: 'game-modal-add-code',
    delete: 'game-modal-delete', // подтверждение — ConfirmModal (confirm.ok)
    codeRow: 'game-modal-code-row', // строка таблицы кодов (+ data-code)
  },

  // Админка: форма входа (modules/admin/components/forms/AdminSigninForm.js)
  adminLogin: {
    nickname: 'admin-login-nickname',
    password: 'admin-login-password',
    submit: 'admin-login-submit',
    error: 'admin-login-error',
  },

  // Админка: вкладки (modules/admin/components/tabs/Tabs.js) — на <span> внутри
  // label: scripts, media-relocate, storage, files, youtube, games, logs
  adminTab: (key) => `admin-tab-${key}`,

  // Админка, вкладка Storage (tabs/Storage.js)
  adminStorage: {
    table: 'admin-storage-table', // обёртка таблицы по типам (есть только после «Обновить»)
    error: 'admin-storage-error',
  },

  // Админка, вкладка Games (components/games/Table.js, Details.js)
  adminGames: {
    search: 'admin-games-search',
    row: 'admin-games-row', // строка таблицы (+ data-game-id)
    details: 'admin-games-details', // кнопка Details в строке
    delete: 'admin-game-delete', // кнопка Delete в карточке игры (нативный confirm)
    deleteError: 'admin-game-delete-error',
  },

  // Админка, вкладка Logs (tabs/Logs.js, components/logs/Table.js)
  adminLogs: {
    table: 'admin-logs-table', // обёртка таблицы
    row: 'admin-logs-row', // строка таблицы
  },

  // Админка: вкладки Scripts и Media relocate — только корень вкладки,
  // действия внутри не размечены намеренно
  adminScripts: { root: 'admin-scripts-root' },
  adminRelocate: { root: 'admin-relocate-root' },

  // Админка, вкладка Files: таблица файлов media (прокси `/admin/media/files`).
  // Фильтры, сортировка и пагинация серверные — тесту нужны сами контролы.
  adminFiles: {
    table: 'admin-files-table',
    reload: 'admin-files-reload',
    reset: 'admin-files-reset',
    error: 'admin-files-error',
    filter: (name) => `admin-files-filter-${name}`, // type, name, min-size, max-size, dates
    row: 'admin-files-row', // строка таблицы (+ data-file-id)
  },

  // Админка, вкладка YouTube: опись ходов, чьё видео распознано как YouTube
  // (`GET /admin/turns/youtube-list`). Только чтение — перезаливка `videoUrl`
  // делается руками через ход/канвас, кнопки переноса на странице нет.
  adminYoutube: {
    table: 'admin-youtube-table', // обёртка таблицы
    error: 'admin-youtube-error',
    row: 'admin-youtube-row', // строка таблицы (+ data-turn-id)
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
