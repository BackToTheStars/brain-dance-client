// Идентификаторы и позиции панелей. Живут здесь, а не в modules/panels/settings.js,
// намеренно: settings.js на уровне модуля собирает массив `panels` из компонентов
// панелей, а те раньше импортировали константы обратно из settings.js — цикл, из-за
// которого прод-сборка падала с «Cannot access 'm' before initialization».
// Этот файл ничего не импортирует и потому безопасен для всех.
export const POSITION_UPPER_LEFT = 'position_upper_left';
export const POSITION_UPPER_CENTER = 'position_upper_center';
export const POSITION_UPPER_RIGHT = 'position_upper_right';
export const POSITION_BOTTOM_RIGHT = 'position_bottom_right';
export const POSITION_BOTTOM_LEFT = 'position_bottom_left';
export const POSITION_BOTTOM_CENTER = 'position_bottom_center';
export const POSITION_NOTIFICATIONS = 'position_notifications';
export const POSITION_FLEXIBLE = 'position_flexible';

export const PANEL_CLASSES = 'panel_classes';
export const PANEL_SETTINGS = 'panel_settings';
export const PANEL_ADD_EDIT_TURN = 'panel_add_edit_turn';
export const PANEL_BUTTONS = 'panel_buttons';
export const PANEL_INFO = 'panel_info';
export const PANEL_MINIMAP = 'panel_minimap';
export const PANEL_NOTIFICATIONS = 'panel_notifications';
export const PANEL_LINES = 'panel_lines';
export const PANEL_TURN_INFO = 'panel_turn_info';
export const PANEL_TURNS_PASTE = 'panel_turns_paste';
export const PANEL_PRESENCE = 'panel_presence';

export const PANEL_MINIMAP_STYLES = 'panel-minimap-styles'; // @todo: check if it's needed
export const PANEL_BUTTONS_STYLES = 'actions';

// Панель редактора хода: ширина тянется сплитом за левый край и помнится на
// пользователя (userSettings.layoutSettings.editorPanelWidth). Минимум снят на
// стенде: уже 650px подпись дропдауна типа хода вылезает за кнопку; максимум —
// окно минус два отступа панелей (как max-width в panels.scss).
export const EDITOR_PANEL_DEFAULT_WIDTH = 900;
export const EDITOR_PANEL_MIN_WIDTH = 650;

// Размер шрифта в редакторе хода (A− / A+), помнится там же
// (layoutSettings.editorFontSize) и в ход не пишется — карточка сохранённого
// хода берёт свой --turn-widget-paragraph-font-size.
export const EDITOR_FONT_SIZE_DEFAULT = 22;
export const EDITOR_FONT_SIZE_MIN = 14;
export const EDITOR_FONT_SIZE_MAX = 36;
export const EDITOR_FONT_SIZE_STEP = 2;

export const MODE_GAME = 'game';
export const MODE_WIDGET_PICTURE = 'widget-picture';
export const MODE_WIDGET_PARAGRAPH = 'widget-paragraph';
export const MODE_WIDGET_VIDEO = 'widget-video';
export const MODE_WIDGET_AUDIO = 'widget-audio';
export const MODE_WIDGET_PDF = 'widget-pdf';

export const MODE_WIDGET_PDF_QUOTE_ADD = 'widget-pdf-quote-add';
export const MODE_WIDGET_PDF_QUOTE_ACTIVE = 'widget-pdf-quote-active';

export const MODE_WIDGET_PICTURE_QUOTE_ADD = 'widget-picture-quote-add';
export const MODE_BUTTON_PICTURE_ADD_AREA = 'widget-picture-add-area';

export const MODE_WIDGET_PICTURE_QUOTE_ACTIVE = 'widget-picture-quote-active';
export const MODE_BUTTON_PICTURE_MODIFY_AREA = 'widget-picture-modify-area';
export const MODE_OPERATION_PASTE = 'operation-paste';

export const MODE_WIDGET_VIDEO_QUOTES_MANAGE = 'widget-video-quotes-manage';
export const MODE_WIDGET_AUDIO_QUOTES_MANAGE = 'widget-audio-quotes-manage';