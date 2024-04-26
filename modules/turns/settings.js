// все переменные для работы Turn

import { Input, Switch } from 'antd';
import ImageUploading from './components/forms/ImageUploading';
import CarouselTemplate from './components/templates/Carousel';
import PictureOnlyTemplate from './components/templates/PictureOnly';
import { HeaderAddForm } from './components/widgets/header/EditForm';
import PictureAddForm from './components/widgets/picture/EditForm';
import { SourceAddForm } from './components/widgets/source/EditForm';
import { VideoAddForm } from './components/widgets/video/EditForm';
import { ParagraphAddForm } from './components/widgets/paragraph/EditForm';

export const TURN_INIT = 'TURN_INIT';
export const TURN_LOADING = 'TURN_LOADING';
export const TURN_LOADING_FIXED = 'TURN_LOADING_FIXED';
export const TURN_READY = 'TURN_READY';

const TEMPLATE_ZERO_POINT = 'zero-point';
const TEMPLATE_PICTURE = 'picture';
const TEMPLATE_VIDEO = 'video';
const TEMPLATE_COMMENT = 'comment';
const TEMPLATE_MIXED = 'mixed';
const TEMPLATE_PDF = 'pdf';
const TEMPLATE_AUDIO = 'audio';
const TEMPLATE_CAROUSEL = 'carousel';
const TEMPLATE_NEWS = 'news';
const TEMPLATE_PICTURE_ONLY = 'picture-only';

const FIELD_HEADER = 'header';
const FIELD_DONT_SHOW_HEADER = 'dontShowHeader';
const FIELD_PICTURE = 'imageUrl';
const FIELD_VIDEO = 'videoUrl';
const FIELD_DATE = 'date';
const FIELD_SOURCE = 'sourceUrl';
const FIELD_BACKGROUND_COLOR = 'backgroundColor';
const FIELD_FONT_COLOR = 'fontColor';
const FIELD_PICTURE_ONLY = 'pictureOnly';

export const WIDGET_PICTURE = 'picture';
export const WIDGET_PARAGRAPH = 'paragraph';

export const WIDGET_HEADER = 'header';
export const WIDGET_VIDEO = 'video';
export const WIDGET_SOURCE = 'source';
export const WIDGET_COMPRESSED = 'compressed';
export const widgetSettings = {
  [WIDGET_HEADER]: {
    label: 'Header',
    prefix: 'h',
    componentToAdd: HeaderAddForm,
    defaultParams: { show: true, text: '' },
    validation: (widgetFields) => {
      const { text, show } = widgetFields;
      if (!show) return [true];
      if (!text) {
        return [false, 'text required'];
      }
      return [true];
    },
    subWidgets: [
      {
        field: 'sources',
        label: 'Sources',
        component: SourceAddForm,
        defaultParams: { url: '', date: null, show: true },
      },
    ],
  },
  [WIDGET_PICTURE]: {
    label: 'Picture',
    prefix: 'i',
    componentToAdd: PictureAddForm,
    defaultParams: { url: '', show: true },
    validation: (widgetFields) => {
      const { url, show } = widgetFields;
      if (!show) return [true];
      if (!url) {
        return [false, 'no picture added'];
      }
      return [true];
    },
    subWidgets: [
      {
        field: 'sources',
        label: 'Sources',
        component: SourceAddForm,
        defaultParams: { url: '', date: null, show: true },
      },
    ],
  },
  [WIDGET_PARAGRAPH]: {
    label: 'Paragraph',
    prefix: 'p',
    componentToAdd: ParagraphAddForm,
    defaultParams: { inserts: [{ insert: '' }], show: true },
    validation: (widgetFields) => {
      const { inserts } = widgetFields;
      if (inserts.length > 1) return [true];
      if (inserts.length === 0 || inserts[0].insert.trim() === '') {
        return [false, 'text area is empty'];
      }
      return [true];
    },
  },
  [WIDGET_VIDEO]: {
    label: 'Video',
    prefix: 'v',
    componentToAdd: VideoAddForm,
    defaultParams: { provider: 'youtube', url: '' },
    validation: (widgetFields) => {
      const { url, provider, show } = widgetFields;
      if (!show) return [true];
      if (provider === 'youtube') {
        if (url.match(/^(http[s]?:\/\/|)(www.|)youtu(.be|be.com)\//)) {
          return [true];
        } else return [false, 'provider is not youtube'];
      }
      return [false, 'provider unknown'];
    },
  },
  [WIDGET_SOURCE]: {
    label: 'Source',
    prefix: 's',
    componentToAdd: SourceAddForm,
  },
};

// по умолчанию виджет текста присутствует
const settings = {
  [TEMPLATE_MIXED]: {
    // это именно тип хода, а не виджета
    component: () => {}, // MixedTemplate,
    value: TEMPLATE_MIXED,
    label: 'Mixed',
    availableWidgets: {},
    optionalWidgets: [],
    description:
      'Экспериментальный шаблон, содержит любые виджеты в любых количествах',
  },

  [TEMPLATE_CAROUSEL]: {
    // это именно тип хода, а не виджета
    component: CarouselTemplate,
    value: TEMPLATE_CAROUSEL,
    label: 'Carousel',
    // availableWidgets: [WIDGET_PICTURE, WIDGET_VIDEO],
    optionalWidgets: [WIDGET_HEADER, WIDGET_SOURCE],
    availableWidgets: {
      [WIDGET_HEADER]: { max: 2, min: 1 },
      [WIDGET_SOURCE]: { max: 1 },
      [WIDGET_PICTURE]: { max: 15 },
      [WIDGET_VIDEO]: { max: 3 },
    },
    description:
      'Ход, в котором есть карусели, одна или несколько, и каждая содержит фото или видео',
    validation: (widgetBlocks) => {
      // const count = widgetBlocks.filter((widgetBlock) => [WIDGET_PICTURE, WIDGET_VIDEO].includes(widgetBlock.type)).length
      // @learn reduce & accumulator
      const count = widgetBlocks.reduce(
        (acc, widgetBlock) =>
          [WIDGET_PICTURE, WIDGET_VIDEO].includes(widgetBlock.type),
        0
      );
      if (count < 2) return [false, 'need more media for carousel'];
      return [true];
    },
  },
  [TEMPLATE_PICTURE_ONLY]: {
    component: PictureOnlyTemplate,
    value: TEMPLATE_PICTURE_ONLY,
    label: 'Picture only',
    availableWidgets: { [WIDGET_PICTURE]: { max: 1, min: 1 } },
    // availableWidgets: [WIDGET_PICTURE],
    optionalWidgets: [],
    description: 'Только картинка, без ничего',
  },
  [TEMPLATE_PICTURE]: {
    value: 'picture',
    label: 'Text / picture',
    availableWidgets: {
      [WIDGET_HEADER]: { max: 1, min: 1 },
      [WIDGET_SOURCE]: { max: 1, min: 0 },
      [WIDGET_PICTURE]: { max: 1, min: 0 },
      [WIDGET_PARAGRAPH]: { max: 1, min: 0 },
    },
    widgetOrder: [
      WIDGET_HEADER,
      WIDGET_PICTURE,
      WIDGET_PARAGRAPH,
      WIDGET_SOURCE,
    ],
    validation: (widgetBlocks) => {
      // const count = widgetBlocks.filter((widgetBlock) => [WIDGET_PICTURE, WIDGET_VIDEO].includes(widgetBlock.type)).length
      // @learn reduce & accumulator
      const count = widgetBlocks.reduce(
        (acc, widgetBlock) =>
          [WIDGET_PICTURE, WIDGET_PARAGRAPH].includes(widgetBlock.type),
        0
      );
      if (count < 1) return [false, 'need either picture or paragraph'];
      return [true];
    },
    //
    requiredFields: [],
    availableFields: [FIELD_PICTURE, FIELD_PICTURE_ONLY],
  },
  [TEMPLATE_VIDEO]: {
    value: 'video',
    label: 'Text / video',

    requiredFields: [FIELD_VIDEO],
    availableFields: [FIELD_VIDEO],
  },
  [TEMPLATE_COMMENT]: {
    value: 'comment',
    label: 'Comment',
    requiredParagraph: true,

    availableFields: [FIELD_BACKGROUND_COLOR, FIELD_FONT_COLOR],
  },
};

const templatesToShow = [
  // TEMPLATE_MIXED,
  TEMPLATE_PICTURE,
  TEMPLATE_VIDEO,
  TEMPLATE_COMMENT,
  // TEMPLATE_CAROUSEL,
  // TEMPLATE_PICTURE_ONLY,
];

const fieldSettings = {
  [FIELD_HEADER]: {
    label: 'Header',
    prefixClass: 'header',
    separate: true,
  },
  [FIELD_DONT_SHOW_HEADER]: {
    label: "Don't show header",
    prefixClass: 'dont-show-header',
    inputType: 'checkbox',
    separate: true,
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
    label: 'Image URL',
    prefixClass: 'image-url',
    special: true,
    inputType: 'component',
    widgetSettings: {
      render: ({ changeHandler, label, prefixClass, value, form }) => {
        return (
          <>
            <Input
              placeholder={`${label}:`}
              value={value}
              onChange={(e) => {
                changeHandler(e.target.value);
              }}
            />
            <ImageUploading setImageUrl={changeHandler} />
          </>
        );
      },
    },
  },
  [FIELD_PICTURE_ONLY]: {
    label: 'Pic only',
    prefixClass: 'pic-only',
    special: true,
    inputType: 'component',
    // separate: true,
    widgetSettings: {
      render: ({ changeHandler, label, prefixClass, value, form }) => {
        return (
          <>
            <Switch
              defaultChecked={false}
              checked={value}
              onChange={(checked) => {
                changeHandler(checked);
              }}
            />{' '}
            <span style={{ fontSize: '1rem' }}>Picture only</span>
          </>
        );
      },
    },
  },
  [FIELD_VIDEO]: {
    label: 'Video URL',
    prefixClass: 'video-url',
    special: true,
  },
  [FIELD_DATE]: {
    label: 'Date',
    prefixClass: 'date',
    inputType: 'date',
    valueCallback: (value) => value.date.slice(0, 10),
    separate: true,
  },
  [FIELD_SOURCE]: {
    label: 'Source Url',
    prefixClass: 'source-url',
    separate: true,
  },
};

const fieldsToShow = Object.keys(fieldSettings); // возвращает массив строк-ключей объекта

// @todo: choose only one format
const fieldsToClone = [
  'originalId',
  'header',
  'dontShowHeader',
  'imageUrl',
  'videoUrl',
  'date',
  'sourceUrl',
  'backgroundColor',
  'fontColor',

  'contentType',
  'paragraph',
  'quotes',
  'scrollPosition',
  'height',
  'width',
  'size',
];

const turnSettings = {
  TEMPLATE_ZERO_POINT,
  TEMPLATE_PICTURE,
  TEMPLATE_VIDEO,
  TEMPLATE_COMMENT,
  TEMPLATE_MIXED,
  TEMPLATE_PDF,
  TEMPLATE_AUDIO,
  TEMPLATE_CAROUSEL,
  TEMPLATE_NEWS,

  FIELD_HEADER,
  FIELD_DONT_SHOW_HEADER,
  FIELD_PICTURE,
  FIELD_VIDEO,
  FIELD_DATE,
  FIELD_SOURCE,

  settings,
  templatesToShow,
  fieldSettings,
  fieldsToShow,
  fieldsToClone,
};

export default turnSettings;
