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
  // страница /game?hash=<адрес>). Роль-опции antd Select берём через getByRole('option').
  gameDialog: {
    nickname: 'game-dialog-nickname',
    role: 'game-dialog-role',
    submit: 'game-dialog-submit',
    notFound: 'game-dialog-not-found', // «игра не найдена» вместо формы
    openAsCode: 'game-dialog-open-as-code', // → /game?code=<та же строка>
    toLobby: 'game-dialog-to-lobby',
  },

  // Окно «срок доступа истёк» (modules/user/components/AccessExpiredModal.js):
  // холст при открытии и при возвращении на вкладку, сокет присутствия, смена ника
  // в диалоге входа. Любая кнопка снимает запись game_<адрес>.
  accessExpired: {
    root: 'access-expired',
    lobby: 'access-expired-lobby', // полная навигация на /
    stay: 'access-expired-stay', // холст дальше посетителем; в диалоге — вход кодом посетителя
  },

  // Диалог входа по коду из ссылки лобби или бота
  // (modules/lobby/components/page/CodeEnterDialog.js, /game?code=<код>, код ещё
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
    otherGame: 'code-other-game', // код от другой игры: доступ сохранён ей, ссылка на неё
  },

  // Холст и его содержимое
  canvas: 'canvas', // #game-box
  canvasLines: 'canvas-lines', // <svg id="lines">
  redLine: 'red-line', // отдельная логическая линия
  turnCard: 'turn-card', // карточка Turn (+ data-turn-id)
  quoteRect: 'quote-rect', // кликабельный прямоугольник цитаты (+ data-turn-id, data-quote-key)
  turnSplit: 'turn-split', // ручка разделителя высоты между виджетами карточки

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
    cropFrame: 'pdf-crop-frame', // рамка «видимая область» в окне настройки обрезки
    cropSettings: 'pdf-crop-fields', // четыре числа обрезки
    cropSide: (side) => `pdf-crop-${side}`, // left | right | top | bottom, проценты
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

  // Лобби: миниатюра карточки ленты (modules/lobby/components/elements/TurnImage.js).
  // Обёртка держит место под картинку; data-image-state: idle (запроса ещё нет) |
  // loading (адрес подставлен) | loaded. Заглушка — /img/video-default.png
  // Та же миниатюра стоит в слайдере хода (sliderModals/TurnModal.js), корень — modal.
  lobbyTurn: {
    image: 'turn-card-image',
    modal: 'turn-modal',
  },

  // Лобби: слайдер игры (modules/lobby/components/sliderModals/GameModal.js)
  gameModal: {
    open: 'game-modal-open',
    addCode: 'game-modal-add-code',
    delete: 'game-modal-delete', // подтверждение — ConfirmModal (confirm.ok)
    codeRow: 'game-modal-code-row', // строка таблицы кодов (+ data-code)
    codeRemove: 'game-modal-code-remove', // «Remove code» в строке (подтверждение — confirm.ok)
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
    limitsTable: 'admin-storage-limits-table', // таблица действующих потолков (GET /admin/media/limits), грузится сама при открытии вкладки
    limitsError: 'admin-storage-limits-error',
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

  // Админка, вкладка Scripts (tabs/Scripts.js): команда с флагом confirm спрашивает
  // нативный confirm() до запуска, ответ success: false — Alert type="error"
  adminScripts: {
    root: 'admin-scripts-root',
    command: 'admin-script-command', // кнопка команды (+ data-script, data-command)
    param: 'admin-script-param', // <input> параметра (+ data-param)
    execute: 'admin-script-execute',
    error: 'admin-script-error',
    result: 'admin-script-result', // <pre> с ответом
  },
  // Админка: вкладка Media relocate — только корень, действия внутри не размечены намеренно
  adminRelocate: { root: 'admin-relocate-root' },

  // Админка, вкладка Files: таблица файлов media (прокси `/admin/media/files`).
  // Фильтры, сортировка и пагинация серверные — тесту нужны сами контролы.
  adminFiles: {
    table: 'admin-files-table',
    reload: 'admin-files-reload',
    reset: 'admin-files-reset',
    error: 'admin-files-error',
    filter: (name) => `admin-files-filter-${name}`, // type, name, min-size, max-size, dates, game
    row: 'admin-files-row', // строка таблицы (+ data-file-id)
    game: 'admin-files-game', // ссылка «адрес игры» в колонке (+ data-game-hash), парой к adminYoutube.game
  },

  // Админка, вкладка YouTube: опись ходов, чьё видео распознано как YouTube
  // (`GET /admin/turns/youtube-list`). Только чтение — перезаливка `videoUrl`
  // делается руками через ход/канвас, кнопки переноса на странице нет.
  adminYoutube: {
    table: 'admin-youtube-table', // обёртка таблицы
    error: 'admin-youtube-error',
    row: 'admin-youtube-row', // строка таблицы (+ data-turn-id)
    game: 'admin-youtube-game', // ссылка «в игре» (+ data-game-hash), новая вкладка,
    // ведёт на /game?hash=<адрес>&turn= — то есть на диалог входа, а не сразу на холст
  },

  // Страница хода в админке, блок «Превью видео» (только для видео своей media).
  adminTurn: {
    videoPreview: 'admin-turn-video-preview', // корень блока
    videoPreviewCurrent: 'admin-turn-video-preview-current', // текущее превью или заглушка
    videoPreviewPlayer: 'admin-turn-video-preview-player', // <video controls> по videoUrl хода
    videoPreviewSeconds: 'admin-turn-video-preview-seconds', // поле t, секунды — связано с позицией плеера
    videoPreviewFrame: 'admin-turn-video-preview-frame', // снятый кадр, есть только после «Показать кадр»
    videoPreviewShow: 'admin-turn-video-preview-show', // «Показать кадр»
    videoPreviewSave: 'admin-turn-video-preview-save', // «Сохранить как превью» (подтверждение — нативный confirm)
    videoPreviewError: 'admin-turn-video-preview-error',
  },

  // Присутствие в игре: переключатель Online в панели Info
  // (modules/panels/components/InfoPanel.js) и панель присутствия
  // (modules/presence/components/PresencePanel.js): действия текущей экскурсии
  // и раскрываемый список участников. Курсор и штрихи живут на холсте.
  presence: {
    toggle: 'presence-toggle', // antd Switch «Online» в InfoPanel (атрибут на кнопке role=switch)
    panel: 'presence-panel', // корень панели присутствия (+ data-collapsed="true|false")
    collapse: 'presence-collapse', // кнопка в заголовке: свернуть панель до иконок и развернуть обратно
    status: 'presence-status', // заголовок панели с data-status; обычный online не выводится текстом
    connection: 'presence-connection', // сообщение о подключении, восстановлении или недоступности связи
    people: 'presence-people', // раскрываемый список участников (details), только в развёрнутом виде
    invite: 'presence-invite', // показать/скрыть поле ссылки
    drawClear: 'presence-draw-clear', // Clear & exit: стереть свои штрихи и выйти из рисования
    lead: 'presence-lead', // кнопка «Start a tour» / «End the tour» (+ data-on="true|false")
    cast: (kind) => `presence-cast-${kind}`, // кнопка трансляции: viewport («Bring everyone to me»)
    member: 'presence-member', // строка участника (+ data-sid, data-nickname, data-leader, data-tour, data-following)
    follow: 'presence-follow', // Join tour в списке ведущих, только вне экскурсии (+ data-tour);
    // в свёрнутом виде списка нет, и та же кнопка стоит иконкой на каждого ведущего
    unfollow: 'presence-unfollow', // единственная Leave tour у спутника
    followers: 'presence-followers', // число подписчиков у гида (+ data-count)
    guide: 'presence-guide', // действия ведущего
    follower: 'presence-follower', // состояние спутника или вход в экскурсию
    tourLink: 'presence-tour-link', // readOnly-поле со ссылкой-приглашением (ссылка — в value)
    tourCopy: 'presence-tour-copy', // кнопка «Copy» рядом с полем ссылки
    cursor: 'presence-cursor', // antd Switch «Share cursor» у ведущего
    guideCursor: 'presence-guide-cursor', // маркер курсора гида на холсте (+ data-sid, data-nickname)
    pencil: 'presence-pencil', // кнопка панели (PanelButton), aria-pressed: выбран карандаш
    eraser: 'presence-eraser', // кнопка панели (PanelButton), aria-pressed: выбран ластик
    group: 'presence-group', // antd Switch Group on minimap, aria-checked
    linesOnTop: 'presence-lines-on-top', // antd Switch «Lines on top» у спутника, aria-checked:
    // линии поверх карточек; то же состояние переключает двойной клик по холсту
    drawCapture: 'presence-draw-capture', // слой захвата пера на холсте (+ data-erasing), есть только при включённом «Pencil»
    drawLayer: 'presence-draw-layer', // svg со штрихами внутри #game-box
    stroke: 'presence-stroke', // polyline штриха (+ data-id, data-from)
    guideAway: 'presence-guide-away', // «Guide is reconnecting…» у ведомого
    tourEnded: 'presence-tour-ended', // «Tour ended» у ведомого
    close: 'presence-close', // Go offline: отключение Online, а не просто скрытие панели
    error: 'presence-error', // текст ошибки: отказ команды сервером или причина остановки
  },

  // Миникарта (modules/minimap/components/Minimap.js). Прямоугольники видимой
  // области спутников экскурсии рисует modules/presence/components/FollowerRects.js
  // внутри её svg — только пока веду и включён «Show the group on the minimap».
  minimap: {
    follower: 'minimap-follower', // <g> с рамкой и ником спутника (+ data-sid, data-nickname)
  },

  // Форма добавления/редактирования turn
  addTurn: {
    typeBtn: 'add-turn-type',
    typeOption: (name) => `add-turn-type-${name}`, // пункт дропдауна типа (picture/video/audio/comment)
    field: (name) => `add-turn-${name}`, // header, source, date, + поля FormInput (по prefixClass)
    // медиа-URL-инпуты используют field(prefixClass): image-url / video-url / audio-url
    save: 'add-turn-save',
    cancel: 'add-turn-cancel',
    // Кнопки тулбара Quill: bold, italic (цвет фона — select.ql-background, ссылка —
    // button.ql-link, их берём по классам Quill)
    toolbar: (name) => `add-turn-toolbar-${name}`,
    // «Format» и подтверждение перед ним: кнопка чистит текст и снимает всё
    // оформление, поэтому при цитатах, ссылках и выделении сначала спрашивает
    format: 'add-turn-format',
    formatConfirm: 'add-turn-format-confirm',
    // Панель редактора: корень — обёртка .panel (её getBoundingClientRect().width и есть
    // ширина панели, та же, что state.panels.d.panel_add_edit_turn.width); ручка
    // сплита на левом краю; A− / A+ — кнопки размера шрифта (PanelButton, disabled на
    // границах ряда), текущее значение — data-font-size на .quill-wrapper
    panel: 'add-turn-panel',
    split: 'add-turn-split',
    fontDec: 'add-turn-font-dec',
    fontInc: 'add-turn-font-inc',
  },

  // Форма хода: блок превью под полем Video URL у видео не с YouTube
  // (modules/turns/components/forms/VideoPreviewBlock.js). Кадр живёт в памяти и уходит
  // в media при Save формы; своя картинка загружается сразу, как у поля картинки.
  videoPreview: {
    root: 'video-preview', // + data-frames="true|false": есть ли плеер для кадра
    current: 'video-preview-current', // <img> + data-source="draft|saved|default", data-frame-seconds у кадра
    player: 'video-preview-player', // <video controls>: файл из дропзоны или видео своей media
    seconds: 'video-preview-seconds', // InputNumber, секунды кадра
    take: 'video-preview-take', // «Take frame»
    capturing: 'video-preview-capturing', // «Taking a frame…»
    custom: 'video-preview-custom', // обёртка дропзоны своей картинки (upload.dropzone, data-upload-type="images")
    error: 'video-preview-error',
  },

  // Панель вставки хода из буфера (modules/panels/components/PasteTurnPanel.js):
  // строка на каждый ход буфера, Paste создаёт ход, Delete убирает из буфера
  // (нативный confirm)
  pasteTurn: {
    paste: 'paste-turn-paste',
    delete: 'paste-turn-delete',
  },

  // Панель Info: форма правки игры владельцем (modules/panels/components/info/EditGameForm.js).
  // Дропзона превью игры внутри формы — общий upload.dropzone с data-upload-type="images"
  info: {
    form: 'info-form', // корень antd Form
    save: 'info-save', // кнопка Save формы
  },
};

export default TID;
