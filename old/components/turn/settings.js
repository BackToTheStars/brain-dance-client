// все переменные для работы Turn

const TEMPLATE_PICTURE = 'picture';
const TEMPLATE_VIDEO = 'video';
const TEMPLATE_COMMENT = 'comment';
const TEMPLATE_MIXED = 'mixed';
const TEMPLATE_PDF = 'pdf';
const TEMPLATE_AUDIO = 'audio';
const TEMPLATE_CAROUSEL = 'carousel';
const TEMPLATE_NEWS = 'news';

const FIELD_HEADER = 'header';
const FIELD_DONT_SHOW_HEADER = 'dontShowHeader';
const FIELD_PICTURE = 'imageUrl';
const FIELD_VIDEO = 'videoUrl';
const FIELD_DATE = 'date';
const FIELD_SOURCE = 'sourceUrl';
const FIELD_BACKGROUND_COLOR = 'backgroundColor';
const FIELD_FONT_COLOR = 'fontColor';

export const WIDGET_PICTURE = 'picture';
export const WIDGET_PARAGRAPH = 'paragraph';

// по умолчанию виджет текста присутствует
const settings = {
  // [TEMPLATE_PICTURE_ONLY]: {
  //   availableFields: [FIELD_PICTURE],
  //   disabledFields: [FIELD_TEXT],
  //   value: 'picture-only',
  //   label: 'Picture',
  // },
  [TEMPLATE_PICTURE]: {
    availableFields: [FIELD_PICTURE],
    value: 'picture',
    label: 'Text / picture',
    requiredFields: [],
  },
  [TEMPLATE_VIDEO]: {
    availableFields: [FIELD_VIDEO],
    value: 'video',
    label: 'Text / video',
    requiredFields: [FIELD_VIDEO],
  },
  [TEMPLATE_COMMENT]: {
    availableFields: [FIELD_BACKGROUND_COLOR, FIELD_FONT_COLOR],
    value: 'comment',
    label: 'Comment',
    requiredParagraph: true,
  },
};

const templatesToShow = [TEMPLATE_PICTURE, TEMPLATE_VIDEO, TEMPLATE_COMMENT];

const fieldSettings = {
  [FIELD_HEADER]: {
    label: 'Header',
    prefixClass: 'header',
  },
  [FIELD_DONT_SHOW_HEADER]: {
    label: "Don't show header",
    prefixClass: 'dont-show-header',
    inputType: 'checkbox',
  },
  [FIELD_BACKGROUND_COLOR]: {
    label: 'Background',
    prefixClass: 'background-color',
    inputType: 'color-picker',
    widgetSettings: {
      colors: ['#bfcef5', '#afe3df', '#d5f0d1', '#eced9a', '#f0dbd1'],
      defaultColor: '#eced9a',
    },
    special: true,
  },
  [FIELD_FONT_COLOR]: {
    label: 'Font Color',
    prefixClass: 'font-color',
    inputType: 'color-picker',
    widgetSettings: {
      colors: ['#0a0a0a', '#17165c', '#0d360e', '#36330d', '#360e0d'],
      defaultColor: '#0a0a0a',
    },
    special: true,
  },
  [FIELD_PICTURE]: {
    label: 'Image Url',
    prefixClass: 'image-url',
    special: true,
  },
  [FIELD_VIDEO]: {
    label: 'Video Url',
    prefixClass: 'video-url',
    special: true,
  },
  [FIELD_DATE]: {
    label: 'Date',
    prefixClass: 'date',
    inputType: 'date',
    valueCallback: (value) => value.date.slice(0, 10),
  },
  [FIELD_SOURCE]: {
    label: 'Source Url',
    prefixClass: 'source-url',
  },
};

const fieldsToShow = Object.keys(fieldSettings); // возвращает массив строк-ключей объекта

const turnSettings = {
  TEMPLATE_PICTURE,
  TEMPLATE_VIDEO,
  TEMPLATE_COMMENT,
  TEMPLATE_MIXED,
  TEMPLATE_PDF,
  TEMPLATE_AUDIO,
  TEMPLATE_CAROUSEL,
  TEMPLATE_NEWS,

  FIELD_HEADER,
  FIELD_PICTURE,
  FIELD_VIDEO,
  FIELD_DATE,
  FIELD_SOURCE,

  settings,
  templatesToShow,
  fieldSettings,
  fieldsToShow,
};

export default turnSettings;
