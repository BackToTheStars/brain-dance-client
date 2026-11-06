import turnSettings from '@/modules/turns/settings';
import {
  filterQuotesDeleted,
  filterQuotesOrphanedByMedia,
} from '@/modules/quotes/components/helpers/filters';
import { filterLinesByQuoteKeys } from '@/modules/lines/components/helpers/line';
import { TURN_MEDIA_QUOTE_BINDINGS } from '@/config/turn';
import { TYPE_QUOTE_TEXT } from '@/modules/quotes/settings';
import { collapseSplitQuotes } from '../helpers/quoteSplitHelper';
import { EMPTY_CROP } from '../widgets/pdf/cropGeometry';
import { snapRound } from '../helpers/grid';
import { GRID_CELL_X } from '@/config/ui';
import { ensureQuoteIds, toPlainText } from '../widgets/md/markdown';
import {
  diffRows,
  dropEmptyRows,
  hasRowsContent,
  normalizeLanguages,
  normalizeRows,
  rowsToPreviewText,
} from '../widgets/translation/rows';

const {
  settings,
  fieldSettings,
  fieldsToShow,
  FIELD_DONT_SHOW_HEADER,
  FIELD_HEADER,
  FIELD_PICTURE,
  FIELD_PICTURE_ONLY,
  FIELD_VIDEO,
  FIELD_AUDIO,
  FIELD_AUDIO_TITLE,
  FIELD_PDF,
  FIELD_MARKDOWN,
  FIELD_ROWS,
  FIELD_LANGUAGES,
  TEMPLATE_MD,
  TEMPLATE_TRANSLATION,
} = turnSettings;

// Медиа-поля в порядке проверки ссылок при Save: тип media и data-field окна.
const MEDIA_URL_FIELDS = [
  { field: FIELD_PICTURE, type: 'images', name: 'image' },
  { field: FIELD_VIDEO, type: 'videos', name: 'video' },
  { field: FIELD_AUDIO, type: 'audios', name: 'audio' },
  { field: FIELD_PDF, type: 'pdfs', name: 'pdf' },
];

// Поля хода так, как их отправит Save: недоступные шаблону — null.
export const prepareFields = (form, template) => {
  const availableFields = settings[template].availableFields || [];
  const prepared = {};
  for (const field of fieldsToShow) {
    prepared[field] =
      !fieldSettings[field].special || availableFields.includes(field)
        ? form[field]
        : null;
  }
  // Пустой текст заголовка не должен уходить как «хэдер включён»: иначе
  // виджет рисует пустую полосу той же высоты, что и с текстом (Turn.js).
  if (!prepared[FIELD_HEADER]?.trim()) {
    prepared[FIELD_DONT_SHOW_HEADER] = true;
  }
  return prepared;
};

// Форма сравнивается со снимком на каждом рендере, а массив рядов меняется только правкой ряда:
// сотни рядов — сотни КБ строки, поэтому строка считается раз на массив.
const rowsKeys = new WeakMap();
const rowsKey = (rows) => {
  if (!Array.isArray(rows)) return JSON.stringify(dropEmptyRows(rows));
  if (!rowsKeys.has(rows)) rowsKeys.set(rows, JSON.stringify(dropEmptyRows(rows)));
  return rowsKeys.get(rows);
};

// Со снимком сравнивается и превью видео: своя картинка или новый кадр — тоже правка.
export const comparableFields = (form, template) => {
  const fields = prepareFields(form, template);
  const videoUrl = fields[FIELD_VIDEO];
  // Ряды и языки перевода — объекты: сравниваются по значению в том виде, в каком уйдут в ход.
  if (template === TEMPLATE_TRANSLATION) {
    fields[FIELD_ROWS] = rowsKey(form[FIELD_ROWS]);
    fields[FIELD_LANGUAGES] = JSON.stringify(normalizeLanguages(form[FIELD_LANGUAGES]));
  }
  return {
    ...fields,
    videoPreview: videoUrl ? form.videoPreview : null,
    videoPreviewDraft: !!videoUrl && form.videoPreviewDraft?.forUrl === videoUrl,
  };
};

// undefined, null, false и '' — одно и то же «пусто».
export const sameFields = (a, b) =>
  Object.keys({ ...a, ...b }).every((key) => (a[key] || '') === (b[key] || ''));

// Ход не пуст, если карточке есть что показать — по тем же правилам, по которым
// Turn.js решает, рисовать ли хэдер, картинку и абзац.
export const hasTurnContent = (template, fields, paragraphHasText) => {
  const { requiredFields = [], requiredParagraph } = settings[template];
  if (template === TEMPLATE_TRANSLATION) return hasRowsContent(fields[FIELD_ROWS]);
  if (requiredFields.length) {
    return requiredFields.every((field) => !!fields[field]?.trim());
  }
  if (requiredParagraph) return paragraphHasText;
  if (fields[FIELD_PICTURE_ONLY]) return !!fields[FIELD_PICTURE]?.trim();
  return (
    !fields[FIELD_DONT_SHOW_HEADER] ||
    !!fields[FIELD_PICTURE]?.trim() ||
    paragraphHasText
  );
};

// Что потеряет ход при замене файла: цитаты старого файла и линии на них. byWidget — по виджетам,
// подписи даёт словарь окна.
const getOrphanedSummary = (orphaned, linesCount) => ({
  quotesCount: orphaned.reduce((sum, item) => sum + item.quotes.length, 0),
  byWidget: orphaned.map((item) => ({ kind: item.kind, count: item.quotes.length })),
  linesCount,
});

// Текстовые цитаты, уходящие из хода вместе со связями; цитата без связей не в счёт.
// null — предупреждать не о чем.
const getLostLinksSummary = (quotesDeleted, linesToDelete, turnId) => {
  const lost = new Set();
  let quotesCount = 0;
  for (const quote of quotesDeleted) {
    if (quote.type !== TYPE_QUOTE_TEXT) continue;
    const quoteLines = filterLinesByQuoteKeys(linesToDelete, [
      `${turnId}_${quote.id}`,
    ]);
    if (!quoteLines.length) continue;
    quotesCount += 1;
    quoteLines.forEach((line) => lost.add(line));
  }
  return quotesCount ? { quotesCount, linesCount: lost.size } : null;
};

// Снятый фон оставляет id на куске: для Quill это два независимых формата. Кусок
// без фона — не цитата, иначе её не удалить снятием фона.
const withoutQuoteId = (textItem) => {
  if (!textItem.attributes?.id) return textItem;
  const { id, ...rest } = textItem.attributes;
  const { attributes, ...plain } = textItem;
  return Object.keys(rest).length ? { ...plain, attributes: rest } : plain;
};

// Сборка сохранения формы хода. Ничего не читает и не пишет вовне: абзац редактора,
// id узлов цитат и время приходят параметрами. { error } — сохранять нельзя.
// baseRows — ряды хода перевода на момент открытия формы: правка шлёт серверу только разницу с ними.
export const buildTurnSave = ({
  textArr,
  quoteElementIds,
  form,
  template,
  turnToEdit,
  baseRows,
  dWidgets,
  lines,
  position,
  viewport,
  now,
  editionToken,
  paragraphExists,
}) => {
  const templateSettings = settings[template];
  const requiredFields = templateSettings.requiredFields || [];
  const requiredParagraph = templateSettings.requiredParagraph || false;

  // Соседние куски одного цвета с равным id сводятся в одну цитату, поэтому
  // свежий id не повторяет занятые.
  const takenIds = new Set(
    [
      ...textArr.map((textItem) => textItem.attributes?.id),
      ...(turnToEdit?.quotes || []).map((quote) => quote.id),
    ]
      .filter((id) => id !== undefined && id !== null)
      .map(String),
  );
  let lastId = Math.floor(now / 1000);
  const freshId = () => {
    do lastId += 1;
    while (takenIds.has(String(lastId)));
    return lastId;
  };

  const resTextArr = [];
  let i = 0;

  const quoteIds = quoteElementIds.map((id) => id || freshId());

  // Подряд идущие куски без id одного цвета — одна новая цитата, разрезанная
  // выделением: id у них общий.
  let newQuote = null;
  for (let textItem of textArr) {
    if (!textItem.attributes || !textItem.attributes.background) {
      resTextArr.push(withoutQuoteId(textItem));
      newQuote = null;
      continue;
    }

    let quoteId = textItem.attributes.id;
    const { background } = textItem.attributes;

    if (quoteId) {
      newQuote = null;
    } else if (newQuote?.background === background) {
      quoteId = newQuote.id;
    } else {
      quoteId = !!turnToEdit && quoteIds[i] ? quoteIds[i] : freshId();
      newQuote = { background, id: quoteId };
    }
    i += 1;
    resTextArr.push({
      ...textItem,
      attributes: {
        ...textItem.attributes,
        id: quoteId,
      },
    });
  }

  const prevQuotes = turnToEdit?.quotes || [];

  // Статья md: выделения исходника получают id и становятся текстовыми цитатами хода,
  // абзац — производный плоский текст; редактор Quill не читается.
  const isMd = template === TEMPLATE_MD;
  const md = isMd ? ensureQuoteIds(form[FIELD_MARKDOWN], now) : null;

  // Перевод: ряды формы без пустых, абзац — начало плоского текста левой колонки, цитат нет.
  const isTranslation = template === TEMPLATE_TRANSLATION;
  const rows = isTranslation ? dropEmptyRows(form[FIELD_ROWS]) : null;

  const paragraphOps = isMd
    ? [{ insert: `${toPlainText(md.source)}\n` }]
    : isTranslation
      ? [{ insert: `${rowsToPreviewText(rows)}\n` }]
      : collapseSplitQuotes(resTextArr);

  let formToPrepare = form;
  if (isMd) formToPrepare = { ...form, [FIELD_MARKDOWN]: md.source };
  if (isTranslation) {
    formToPrepare = {
      ...form,
      [FIELD_ROWS]: rows,
      [FIELD_LANGUAGES]: normalizeLanguages(form[FIELD_LANGUAGES]),
    };
  }
  const preparedForm = prepareFields(formToPrepare, template);

  for (let requiredField of requiredFields) {
    if (!preparedForm[requiredField]) {
      return { error: { message: `Need ${requiredField}` } };
    }
  }
  if (isTranslation && !hasRowsContent(rows)) {
    return { error: { message: `Need ${FIELD_ROWS}` } };
  }

  if (requiredParagraph && !paragraphExists(paragraphOps)) {
    return { error: { message: 'Need text body' } };
  }

  const quotes = isMd ? [...md.quotes] : [];

  for (let textItem of paragraphOps) {
    if (textItem.attributes && textItem.attributes.id) {
      quotes.push({
        id: textItem.attributes.id,
        text: textItem.insert,
        type: 'text',
      });
    }
  }

  // Замена, очистка файла или смена типа хода обесценивают цитаты в координатах
  // файла — одно правило на все типы (TURN_MEDIA_QUOTE_BINDINGS).
  const orphaned = turnToEdit
    ? filterQuotesOrphanedByMedia({
        prevFields: turnToEdit,
        nextFields: preparedForm,
        prevQuotes,
        getTimelineQuotes: (widgetId) => dWidgets?.[widgetId]?.quotes,
      })
    : [];

  const dOrphanedQuoteIds = {};
  for (const item of orphaned) {
    for (const quote of item.quotes) {
      dOrphanedQuoteIds[quote.id] = true;
    }
  }

  for (let prevQuote of prevQuotes) {
    if (
      prevQuote.type !== TYPE_QUOTE_TEXT &&
      !dOrphanedQuoteIds[prevQuote.id]
    ) {
      quotes.push(prevQuote);
    }
  }

  // Осиротевшие цитаты не попали в quotes, и их линии удаляются общим путём.
  const quotesDeleted = filterQuotesDeleted(prevQuotes, quotes);
  // Цитаты ленты живут не в quotes хода — их ключи добавляются отдельно.
  const timelineQuotesDeleted = orphaned
    .filter((item) => item.timelineField)
    .flatMap((item) => item.quotes);

  const quoteKey = (quote) => `${turnToEdit._id}_${quote.id}`;
  const keysDeleted = turnToEdit
    ? [...quotesDeleted, ...timelineQuotesDeleted].map(quoteKey)
    : [];
  const linesToDelete = turnToEdit
    ? filterLinesByQuoteKeys(lines, keysDeleted)
    : [];

  // Окно замены файла считает все связи, которые уйдут с сохранением: на цитатах
  // файла и на снятых в тексте.
  const orphanedLines = orphaned.length
    ? filterLinesByQuoteKeys(
        lines,
        orphaned.flatMap((item) => item.quotes).map(quoteKey),
      )
    : [];
  const lostLines = new Set([...orphanedLines, ...linesToDelete]);

  // Превью принадлежит видео: без видео (или после его замены) уходит пустым.
  const videoUrl = preparedForm[FIELD_VIDEO];
  const previewDraft =
    videoUrl && form.videoPreviewDraft?.forUrl === videoUrl
      ? form.videoPreviewDraft
      : null;

  let turnObj = {
    ...preparedForm,
    paragraph: paragraphOps,
    contentType: template,
    quotes: [...quotes],
    videoPreview: (videoUrl && form.videoPreview) || null,
  };

  // Пустое название уходит null, только если стирает сохранённое; иначе ключа нет —
  // ход другого типа поля не получает.
  const audioTitle = preparedForm[FIELD_AUDIO_TITLE]?.trim();
  if (audioTitle) turnObj[FIELD_AUDIO_TITLE] = audioTitle;
  else if (turnToEdit?.[FIELD_AUDIO_TITLE]) turnObj[FIELD_AUDIO_TITLE] = null;
  else delete turnObj[FIELD_AUDIO_TITLE];

  // Отрезки ленты покрывают длительность прежнего файла — у нового она другая, лента
  // снимается целиком, и без цитат тоже.
  for (const binding of TURN_MEDIA_QUOTE_BINDINGS) {
    if (!binding.timelineField || !turnToEdit) continue;
    const prevUrl = turnToEdit[binding.field] || '';
    if (prevUrl && prevUrl !== (preparedForm[binding.field] || '')) {
      turnObj[binding.timelineField] = null;
    }
  }

  // Обрезка задана в координатах прежнего документа и сбрасывается без вопроса —
  // и когда цитат не было вовсе.
  for (const binding of TURN_MEDIA_QUOTE_BINDINGS) {
    if (!binding.cropField || !turnToEdit) continue;
    const prevUrl = turnToEdit[binding.field] || '';
    const nextUrl = preparedForm[binding.field] || '';
    if (prevUrl && prevUrl !== nextUrl) {
      turnObj[binding.cropField] = { ...EMPTY_CROP };
    }
  }

  // Ряды в теле хода — только при создании перевода: правка шлёт их отдельным запросом
  // операциями, а ход другого типа ключей rows / languages не несёт вовсе.
  if (!isTranslation) {
    delete turnObj[FIELD_ROWS];
    delete turnObj[FIELD_LANGUAGES];
  } else if (turnToEdit) {
    delete turnObj[FIELD_ROWS];
  }

  if (!!turnToEdit) {
    turnObj._id = turnToEdit._id;
    turnObj.x = turnToEdit.x;
    turnObj.y = turnToEdit.y;
  } else {
    turnObj.height = 600;
    // Кратна сетке: карточка при монтировании прижимает ширину к ней.
    turnObj.width = 768;
    turnObj.x = snapRound(
      position.x + (viewport.width - turnObj.width) / 2,
      GRID_CELL_X,
    );
    turnObj.y = snapRound(
      position.y + (viewport.height - turnObj.height) / 2,
      GRID_CELL_X,
    );
  }

  const payload = {
    turnObj,
    isNew: !turnToEdit,
    lineIdsToDelete: linesToDelete.map((line) => line._id),
    quoteKeysDeleted: keysDeleted,
    previewDraft,
    editionToken,
  };
  // Правка перевода: операции над рядами от открытия формы (null — ряды не менялись) и ряды
  // целиком для стора — ответ сервера их не несёт.
  if (isTranslation && turnToEdit) {
    payload.translation = { rows, rowsOps: diffRows(normalizeRows(baseRows), rows) };
  }

  const orphanSummary = orphaned.length
    ? getOrphanedSummary(orphaned, lostLines.size)
    : null;

  // Окно одно: при замене файла его уже показывает сводка выше.
  const lostLinks = orphanSummary
    ? null
    : getLostLinksSummary(quotesDeleted, linesToDelete, turnToEdit?._id);

  const changedLinks = MEDIA_URL_FIELDS.filter(
    ({ field }) =>
      preparedForm[field] &&
      preparedForm[field] !== (turnToEdit?.[field] || ''),
  ).map((link) => ({ ...link, url: preparedForm[link.field] }));

  return {
    payload,
    orphanSummary,
    lostLinks,
    changedLinks,
    quotesDeleted,
    linesToDelete,
  };
};
