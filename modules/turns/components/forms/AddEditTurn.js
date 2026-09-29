import {
  checkIfParagraphExists,
  getQuill,
  getQuoteElements,
  isSameContents,
  QUOTE_ID_ATTRIBUTE,
} from '@/modules/turns/components/helpers/quillHelper';
import { useEffect, useState, useMemo, useRef } from 'react';
import turnSettings, { WIDGET_HEADER } from '@/modules/turns/settings';
import FormInput from './FormInput';
import { useDispatch, useSelector } from 'react-redux';
import {
  toggleMaximizeQuill,
  togglePanel,
} from '@/modules/panels/redux/actions';
import PanelButton from '@/modules/panels/components/PanelButton';
import EditorPanelSplit from '@/modules/panels/components/EditorPanelSplit';
import {
  clampEditorFontSize,
  readEditorFontSize,
  saveEditorFontSize,
} from '@/modules/panels/helpers/editorPanel';
import {
  EDITOR_FONT_SIZE_DEFAULT,
  EDITOR_FONT_SIZE_MAX,
  EDITOR_FONT_SIZE_MIN,
  EDITOR_FONT_SIZE_STEP,
  PANEL_ADD_EDIT_TURN,
} from '@/config/panel';
import { createTurn, resaveTurn, uploadMedia } from '../../redux/actions';
import { dataUrlToFile, frameFileName } from '../helpers/videoFrame';
import {
  filterQuotesDeleted,
  filterQuotesOrphanedByMedia,
} from '@/modules/quotes/components/helpers/filters';
import { filterLinesByQuoteKeys } from '@/modules/lines/components/helpers/line';
import { TURN_MEDIA_QUOTE_BINDINGS } from '@/config/turn';
import { clearQuotesInfo, linesDelete } from '@/modules/lines/redux/actions';
import { setActiveQuoteKey } from '@/modules/quotes/redux/actions';
import { TYPE_QUOTE_TEXT } from '@/modules/quotes/settings';
import DropdownTemplate from '../inputs/DropdownTemplate';
import { Button, DatePicker, Input, Modal, Switch } from 'antd';
import dayjs from 'dayjs';
import { cleanText, getFormatLoss } from '../helpers/textHelper';
import { collapseSplitQuotes } from '../helpers/quoteSplitHelper';
import { TurnHelper } from '../../redux/helpers';
import { createFormEdition } from '../helpers/formEdition';
import {
  isNotMediaUrl,
  needsProbe,
  probeMedia,
} from '../helpers/mediaUrlCheck';
import { TID } from '@/config/testIds';
import { EMPTY_CROP } from '../widgets/pdf/cropGeometry';
import { snapRound } from '../helpers/grid';
import { GRID_CELL_X } from '@/config/ui';
import { castSaved } from '@/modules/presence/redux/actions';

const {
  settings,
  templatesToShow,
  fieldSettings,
  fieldsToShow,
  TEMPLATE_PICTURE,
  FIELD_DONT_SHOW_HEADER,
  FIELD_HEADER,
  FIELD_PICTURE,
  FIELD_PICTURE_ONLY,
  FIELD_SOURCE,
  FIELD_DATE,
  FIELD_VIDEO,
  FIELD_AUDIO,
  FIELD_PDF,
} = turnSettings;

// Медиа-поля в порядке проверки ссылок при Save: тип media и data-field окна.
const MEDIA_URL_FIELDS = [
  { field: FIELD_PICTURE, type: 'images', name: 'image' },
  { field: FIELD_VIDEO, type: 'videos', name: 'video' },
  { field: FIELD_AUDIO, type: 'audios', name: 'audio' },
  { field: FIELD_PDF, type: 'pdfs', name: 'pdf' },
];

const NOT_MEDIA_TEXTS = {
  image: {
    title: 'Похоже, это не картинка',
    inField: 'в поле картинки',
    asType: 'как картинка',
    result: 'В ходе на её месте будет значок ошибки.',
  },
  video: {
    title: 'Похоже, это не видео',
    inField: 'в поле видео',
    asType: 'как видео',
    result: 'Плеер в ходе её не проиграет.',
  },
  audio: {
    title: 'Похоже, это не аудио',
    inField: 'в поле аудио',
    asType: 'как аудио',
    result: 'Плеер в ходе её не проиграет.',
  },
  pdf: {
    title: 'Похоже, это не PDF',
    inField: 'в поле PDF',
    asType: 'как PDF',
    result: 'В ходе на её месте будет сообщение об ошибке.',
  },
};

// Поля хода так, как их отправит Save: недоступные шаблону — null.
const prepareFields = (form, template) => {
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

// Со снимком сравнивается и превью видео: своя картинка или новый кадр — тоже правка.
const comparableFields = (form, template) => {
  const fields = prepareFields(form, template);
  const videoUrl = fields[FIELD_VIDEO];
  return {
    ...fields,
    videoPreview: videoUrl ? form.videoPreview : null,
    videoPreviewDraft: !!videoUrl && form.videoPreviewDraft?.forUrl === videoUrl,
  };
};

// undefined, null, false и '' — одно и то же «пусто».
const sameFields = (a, b) =>
  Object.keys({ ...a, ...b }).every((key) => (a[key] || '') === (b[key] || ''));

// Ход не пуст, если карточке есть что показать — по тем же правилам, по которым
// Turn.js решает, рисовать ли хэдер, картинку и абзац.
const hasTurnContent = (template, fields, paragraphHasText) => {
  const { requiredFields = [], requiredParagraph } = settings[template];
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

const SAVE_HINTS = {
  empty: 'Nothing to save: the turn is empty',
  unchanged: 'Nothing to save: no changes',
  checking: 'Checking the link…',
  preview: 'Uploading the video preview…',
};

// Что именно потеряет ход, если сохранить замену файла: цитаты старого
// файла и логические линии, которые на них держались.
const getOrphanedSummary = (orphaned, linesCount) => ({
  quotesCount: orphaned.reduce((sum, item) => sum + item.quotes.length, 0),
  byWidget: orphaned
    .map((item) => `${item.label} — ${item.quotes.length}`)
    .join(', '),
  linesCount,
});

// Снятый фон оставляет id на куске: для Quill это два независимых формата. Кусок
// без фона — не цитата, иначе её не удалить снятием фона.
const withoutQuoteId = (textItem) => {
  if (!textItem.attributes?.id) return textItem;
  const { id, ...rest } = textItem.attributes;
  const { attributes, ...plain } = textItem;
  return Object.keys(rest).length ? { ...plain, attributes: rest } : plain;
};

const getDate = (mixedDate) => {
  const d = new Date(mixedDate);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(d.getDay()).padStart(2, '0')}`;
};

const AddEditTurnPopup = () => {
  const gamePosition = useSelector((state) => state.game.position);
  const viewport = useSelector((state) => state.game.viewport);
  const editTurnId = useSelector((state) => state.panels.editTurnId);
  const turnData = useSelector((state) => state.turns.d[editTurnId]);
  const turnGeometry = useSelector((state) => state.turns.g[editTurnId]);
  const activeQuoteKey = useSelector((state) => state.quotes.activeQuoteKey);
  // @fixme
  const turnToEdit = useMemo(
    () =>
      turnData && turnGeometry
        ? TurnHelper.toOldFields({
            ...turnData,
            ...turnGeometry,
          })
        : null,
    [turnData, turnGeometry],
  );
  const [quillConstants, setQuillConstants] = useState({}); // { quill, getQuillTextArr }
  const [activeTemplate, setActiveTemplate] = useState(TEMPLATE_PICTURE);
  const [error, setError] = useState(null);
  const templateSettings = settings[activeTemplate];

  const availableFields = templateSettings.availableFields || [];
  const requiredFields = templateSettings.requiredFields || [];
  const requiredParagraph = templateSettings.requiredParagraph || false;
  const Component = templateSettings.component || null;
  const [form, setForm] = useState({
    check: true,
  });
  const [isMaximized, setIsMaximized] = useState(false);
  // Размер шрифта редактора (A− / A+): переменная на .quill-wrapper, помнится на
  // пользователя и в ход не пишется. Читается в эффекте — хранилище есть только
  // в браузере.
  const [fontSize, setFontSize] = useState(EDITOR_FONT_SIZE_DEFAULT);
  // Подтверждение удаления цитат при замене файла: здесь лежит уже
  // собранное сохранение и то, что о нём показать. null — окна нет.
  // { payload, summary } — payload уходит в commitSave по «Удалить и сохранить».
  const [orphanConfirm, setOrphanConfirm] = useState(null);
  // Подтверждение перед Format: что именно снимется с абзаца (getFormatLoss).
  // null — окна нет, значит и терять было нечего.
  const [formatConfirm, setFormatConfirm] = useState(null);
  // Редакция, чей кадр сейчас грузится: Save блокируется только у неё.
  const [savingPreview, setSavingPreview] = useState(0);
  // То же для пробной загрузки ссылки медиа-поля перед записью.
  const [checkingLink, setCheckingLink] = useState(0);
  // Окно «Похоже, это не …»: { name, url, reason, rest, payload, orphanSummary },
  // где rest — ещё не проверенные поля.
  const [notMediaConfirm, setNotMediaConfirm] = useState(null);
  const confirmedNotMedia = useRef(null);
  // Поле последнего окна — отдельно: заголовок не гаснет на анимации закрытия.
  const [notMediaName, setNotMediaName] = useState('image');
  const notMediaText = NOT_MEDIA_TEXTS[notMediaName];
  // Quill неуправляемый: копия абзаца для Save обновляется по text-change.
  const [editorOps, setEditorOps] = useState([]);
  // Снимок открытого на правку хода { token, template, fields, paragraph }; null —
  // форма ещё устаивается или ход новый.
  const [baseline, setBaseline] = useState(null);
  const formRef = useRef(form);
  formRef.current = form;

  // Начатый формой ответ применяется только к ней самой: у каждого открытого хода
  // своя редакция, у закрытой панели актуальной редакции нет.
  const editionRef = useRef(null);
  if (!editionRef.current) editionRef.current = createFormEdition();
  const edition = editionRef.current;
  edition.open(editTurnId);
  useEffect(() => () => edition.close(), []);

  const dispatch = useDispatch();

  const hidePanel = () => {
    dispatch(togglePanel({ type: PANEL_ADD_EDIT_TURN }));
    dispatch(toggleMaximizeQuill(false));
  };
  const dLines = useSelector((state) => state.lines.d);
  const lines = useMemo(() => Object.values(dLines), [dLines]);

  const toggleMaximize = (value) => {
    setIsMaximized(value);
    dispatch(toggleMaximizeQuill(value));
  };

  // Перечитывается и после сброса раскладки в Info — при открытой форме.
  const layoutResets = useSelector((state) => state.panels.layoutResets);
  useEffect(() => {
    setFontSize(readEditorFontSize());
  }, [layoutResets]);

  const changeFontSize = (delta) => {
    const next = clampEditorFontSize(fontSize + delta);
    setFontSize(next);
    saveEditorFontSize(next);
  };

  useEffect(() => {
    if (!quillConstants.quill) return;
    setBaseline(null);
    if (!!turnToEdit) {
      setActiveTemplate(turnToEdit.contentType);
      const newForm = {};
      for (let fieldToShow of fieldsToShow) {
        if (!!turnToEdit[fieldToShow]) {
          if (!!fieldSettings[fieldToShow].valueCallback) {
            newForm[fieldToShow] =
              fieldSettings[fieldToShow].valueCallback(turnToEdit); // можно использовать не только для даты, но и для других полей
          } else {
            newForm[fieldToShow] = turnToEdit[fieldToShow]; // получаем все поля кроме параграфа
          }
        }
      }
      if (turnToEdit.videoPreview) newForm.videoPreview = turnToEdit.videoPreview;
      setForm(newForm);
      const { quill } = quillConstants;
      quill.setContents(turnToEdit.paragraph || []);
      const token = edition.token();
      setTimeout(() => {
        // за эти 300 мс могли открыть другой ход — его цитатам чужие id не ставим
        if (!edition.isCurrent(token)) return;
        const paragraphQuotes = turnToEdit.quotes
          ? turnToEdit.quotes.filter((quote) => quote.type === 'text')
          : [];
        const quoteEls = getQuoteElements();
        let i = 0;
        let incId = Math.floor(new Date().getTime() / 1000);
        for (let quoteEl of quoteEls) {
          // По порядку — только ходам старше атрибутора.
          if (!quoteEl.getAttribute(QUOTE_ID_ATTRIBUTE)) {
            const quoteId = paragraphQuotes[i]
              ? paragraphQuotes[i].id
              : (incId += 1);
            quoteEl.setAttribute(QUOTE_ID_ATTRIBUTE, quoteId);
          }
          i += 1;
        }
        // Проставленные id Quill заберёт из DOM только следующим тиком — забираем
        // сейчас, иначе они придут после снимка и сойдут за правку.
        quill.update();
        const paragraph = quill.getContents().ops;
        setEditorOps(paragraph);
        setBaseline({
          token,
          template: turnToEdit.contentType,
          fields: comparableFields(formRef.current, turnToEdit.contentType),
          paragraph,
        });
      }, 300);
    } else {
      setForm({});
      const { quill } = quillConstants;
      if (!!quill) {
        quill.setContents([]);
      }
    }
  }, [turnToEdit, quillConstants]);

  useEffect(() => {
    setQuillConstants(
      getQuill('#editor-container-new', '#toolbar-container-new'),
    );
  }, []);

  useEffect(() => {
    const { quill } = quillConstants;
    if (!quill) return;
    const sync = () => setEditorOps(quill.getContents().ops);
    sync();
    quill.on('text-change', sync);
    return () => quill.off('text-change', sync);
  }, [quillConstants]);

  // Само сохранение. Вынесено из saveHandler, потому что при замене файла между
  // «нажал Save» и записью встаёт модальное окно, а оно отвечает асинхронно:
  // saveHandler только собирает payload, коммитит либо он сам, либо кнопка
  // «Удалить и сохранить».
  const commitSave = async ({
    turnObj: preparedTurn,
    lineIdsToDelete,
    isNew,
    quoteKeysDeleted = [],
    previewDraft,
    editionToken,
  }) => {
    let turnObj = preparedTurn;
    // Форму могли закрыть или перевести на другой ход, пока media отвечала: сам ход
    // сохраняется (его просили сохранить), а форму трогает только своя редакция.
    const token = editionToken || edition.token();
    // Кадр живёт в памяти формы и уходит в media один раз — здесь.
    if (previewDraft) {
      setSavingPreview(token);
      try {
        const file = dataUrlToFile(
          previewDraft.dataUrl,
          frameFileName(previewDraft.name, previewDraft.t),
        );
        const data = await dispatch(uploadMedia('images', file));
        turnObj = { ...turnObj, videoPreview: data.src };
        if (edition.isCurrent(token)) {
          patchForm({ videoPreview: data.src, videoPreviewDraft: null });
        }
      } catch (err) {
        if (edition.isCurrent(token)) {
          patchForm({
            videoPreviewError: `Preview upload failed: ${err?.message || err}`,
          });
        }
        return;
      } finally {
        setSavingPreview((prev) => (prev === token ? 0 : prev));
      }
    }

    const linesDeleted = lineIdsToDelete.length
      ? dispatch(linesDelete(lineIdsToDelete))
      : null;
    if (quoteKeysDeleted.length) {
      dispatch(clearQuotesInfo(quoteKeysDeleted));
      // цитата, снятая этим сохранением, не может остаться активной
      if (quoteKeysDeleted.includes(activeQuoteKey)) {
        dispatch(setActiveQuoteKey(null));
      }
    }

    const saveCallbacks = {
      // @todo: передавать в виджет через props
      // Закрывается только та форма, которая сохранялась: иначе поздний ответ
      // открыл бы закрытую панель или закрыл начатую правку другого хода.
      success: () => {
        // Спутникам ведущего — и после закрытия формы, но не раньше удаления линий
        // снятых цитат: иначе их перезапрос застанет эти линии.
        Promise.resolve(linesDeleted).then(() => dispatch(castSaved()));
        if (!edition.isCurrent(token)) return;
        dispatch(togglePanel({ type: PANEL_ADD_EDIT_TURN, open: false }));
        dispatch(toggleMaximizeQuill(false));
      },
    };

    // @fixme
    dispatch(
      isNew
        ? createTurn(turnObj, saveCallbacks)
        : resaveTurn(turnObj, saveCallbacks),
    );
  };

  const saveHandler = (e) => {
    e.preventDefault(); // почитать про preventDefault()
    if (edition.isCurrent(checkingLink)) return;
    const textArr = quillConstants.getQuillTextArr();

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
    let lastId = Math.floor(new Date().getTime() / 1000);
    const freshId = () => {
      do lastId += 1;
      while (takenIds.has(String(lastId)));
      return lastId;
    };

    const resTextArr = [];
    let i = 0;

    const quoteIds = [];
    for (let quoteEl of getQuoteElements()) {
      quoteIds.push(quoteEl.getAttribute(QUOTE_ID_ATTRIBUTE) || freshId());
    }

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

    const paragraphOps = collapseSplitQuotes(resTextArr);

    const preparedForm = prepareFields(form, activeTemplate);

    for (let requiredField of requiredFields) {
      if (!preparedForm[requiredField]) {
        return setError({ message: `Need ${requiredField}` });
      }
    }

    if (requiredParagraph && !checkIfParagraphExists(paragraphOps)) {
      return setError({ message: 'Need text body' });
    }

    const quotes = [];

    for (let textItem of paragraphOps) {
      if (textItem.attributes && textItem.attributes.id) {
        quotes.push({
          id: textItem.attributes.id,
          text: textItem.insert,
          type: 'text',
        });
      }
    }

    // Замена файла обесценивает цитаты, заданные в его координатах:
    // прямоугольные у картинки и pdf, отрезки таймлайна у видео и аудио. Правило
    // одно на все типы (TURN_MEDIA_QUOTE_BINDINGS) и срабатывает одинаково на
    // замену файла, его очистку и смену типа хода.
    const orphaned = turnToEdit
      ? filterQuotesOrphanedByMedia({
          prevFields: turnToEdit,
          nextFields: preparedForm,
          prevQuotes,
          getTimelineQuotes: (widgetId) =>
            turnData?.dWidgets?.[widgetId]?.quotes,
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

    // Осиротевшие цитаты остались в prevQuotes и не попали в quotes, поэтому
    // filterQuotesDeleted их и посчитает — линии за ними удалит общий путь в
    // commitSave, отдельной ветки удаления для них не заводим.
    const quotesDeleted = filterQuotesDeleted(prevQuotes, quotes);

    const quoteKey = (quote) => `${turnToEdit._id}_${quote.id}`;
    const linesToDelete = turnToEdit
      ? filterLinesByQuoteKeys(lines, quotesDeleted.map(quoteKey))
      : [];

    // Отдельно — линии, которые держались именно на цитатах заменённого файла:
    // о них спрашивает окно, поэтому и счётчик в нём должен быть про них, а не
    // про весь набор удаляемого (в тот же проход мог измениться и текст).
    const orphanedLines = orphaned.length
      ? filterLinesByQuoteKeys(
          lines,
          orphaned.flatMap((item) => item.quotes).map(quoteKey),
        )
      : [];

    // Превью принадлежит видео: без видео (или после его замены) уходит пустым.
    const videoUrl = preparedForm[FIELD_VIDEO];
    const previewDraft =
      videoUrl && form.videoPreviewDraft?.forUrl === videoUrl
        ? form.videoPreviewDraft
        : null;

    let turnObj = {
      ...preparedForm,
      paragraph: paragraphOps,
      contentType: activeTemplate,
      quotes: [...quotes],
      videoPreview: (videoUrl && form.videoPreview) || null,
    };

    // Таймлайн видео/аудио лежит не в `quotes`, а отдельным полем хода, и его
    // фрагменты обязаны покрывать длительность файла целиком (иначе виджет бросает
    // «Last quote should end at duration»). У нового файла длительность другая,
    // поэтому виджет снимается целиком — так же, как это делает
    // deleteVideoQuotesWidget. На новом файле его можно добавить заново.
    for (const item of orphaned) {
      if (item.timelineField) {
        turnObj[item.timelineField] = null;
      }
    }

    // Обрезка задана в координатах прежнего документа — на файле с другой
    // геометрией страниц она бессмысленна. Проверяется отдельно от `orphaned`
    // (та ветка молчит, когда цитат не было вовсе, а обрезка могла стоять и
    // без единой цитаты) и не спрашивает подтверждения — это не потеря данных
    // пользователя, а автоматический сброс того, что уже не имеет смысла.
    for (const binding of TURN_MEDIA_QUOTE_BINDINGS) {
      if (!binding.cropField || !turnToEdit) continue;
      const prevUrl = turnToEdit[binding.field] || '';
      const nextUrl = preparedForm[binding.field] || '';
      if (prevUrl && prevUrl !== nextUrl) {
        turnObj[binding.cropField] = { ...EMPTY_CROP };
      }
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
        gamePosition.x + (viewport.width - turnObj.width) / 2,
        GRID_CELL_X,
      );
      turnObj.y = snapRound(
        gamePosition.y + (viewport.height - turnObj.height) / 2,
        GRID_CELL_X,
      );
    }

    const payload = {
      turnObj,
      isNew: !turnToEdit,
      lineIdsToDelete: linesToDelete.map((line) => line._id),
      quoteKeysDeleted: quotesDeleted.map(quoteKey),
      previewDraft,
      editionToken: edition.token(),
    };

    const orphanSummary = orphaned.length
      ? getOrphanedSummary(orphaned, orphanedLines.length)
      : null;

    const changedLinks = MEDIA_URL_FIELDS.filter(
      ({ field }) =>
        preparedForm[field] &&
        preparedForm[field] !== (turnToEdit?.[field] || ''),
    ).map((link) => ({ ...link, url: preparedForm[link.field] }));
    checkMediaLinks(changedLinks, payload, orphanSummary);
  };

  // Цитаты и связи теряются молча только если терять нечего. Иначе — окно с
  // числами и явным «Удалить и сохранить»; отказ не сохраняет ничего, то есть
  // остаются и прежний файл, и цитаты, и связи.
  const finishSave = (payload, orphanSummary) => {
    if (orphanSummary) {
      setOrphanConfirm({ payload, summary: orphanSummary });
      return;
    }
    commitSave(payload);
  };

  // Новые ссылки медиа-полей по очереди: не тот тип — окно, «Сохранить всё
  // равно» продолжает с оставшихся; таймаут отказом не считается. Если за время
  // проверки форму закрыли или перевели на другой ход, не сохраняется ничего.
  const checkMediaLinks = ([link, ...rest], payload, orphanSummary) => {
    if (!link) return finishSave(payload, orphanSummary);
    const { name, type, url } = link;
    const next = () => checkMediaLinks(rest, payload, orphanSummary);
    const ask = (reason) => {
      setNotMediaName(name);
      setNotMediaConfirm({ name, url, reason, rest, payload, orphanSummary });
    };
    if (isNotMediaUrl(url, type)) return ask('type');
    if (!needsProbe(url, type)) return next();
    const token = edition.token();
    setCheckingLink(token);
    probeMedia(url, type).then((result) => {
      setCheckingLink((prev) => (prev === token ? 0 : prev));
      if (!edition.isCurrent(token)) return;
      if (result === 'error') ask('load');
      else next();
    });
  };

  // Format переклеивает переносы и пробелы, а вместе с ними теряет всю разметку:
  // документ заменяется плоским текстом. Отобразить старые диапазоны на новый текст
  // нечем — смещения после чистки другие, — поэтому спрашиваем.
  const applyFormat = () => {
    const { quill } = quillConstants;
    quill.setText(cleanText(quill.getText()));
  };

  const formatHandler = () => {
    const loss = getFormatLoss(quillConstants.getQuillTextArr());
    if (!loss.total) return applyFormat();
    setFormatConfirm(loss);
  };

  // Только функциональный setState: два ColorPicker'а ставят свои дефолты в эффектах
  // одного коммита, и обычный `{ ...form }` из замыкания терял значение первого
  // (backgroundColor у комментария оставался пустым).
  const formChangeHandler = (field, value) => {
    if (!!error) setError(null);

    setForm((prevForm) => ({ ...prevForm, [field]: value }));
  };

  // Несколько полей разом; patch — объект или функция от прежней формы.
  const patchForm = (patch) =>
    setForm((prevForm) => ({
      ...prevForm,
      ...(typeof patch === 'function' ? patch(prevForm) : patch),
    }));

  const paragraphChanged = useMemo(
    () => !!baseline && !isSameContents(editorOps, baseline.paragraph),
    [editorOps, baseline],
  );
  const hasContent = hasTurnContent(
    activeTemplate,
    prepareFields(form, activeTemplate),
    checkIfParagraphExists(editorOps),
  );
  const changed =
    !!baseline &&
    edition.isCurrent(baseline.token) &&
    (activeTemplate !== baseline.template ||
      paragraphChanged ||
      !sameFields(comparableFields(form, activeTemplate), baseline.fields));
  let saveState = 'ready';
  if (edition.isCurrent(savingPreview)) saveState = 'preview';
  else if (edition.isCurrent(checkingLink)) saveState = 'checking';
  else if (!hasContent) saveState = 'empty';
  else if (turnToEdit && !changed) saveState = 'unchanged';

  if (Component) {
    return (
      <>
      <EditorPanelSplit />
      <div
        className={`panel-inner flex flex-col h-full flex-1`}
      >
        <div className="panel-cell">
          <div className="panel-flex mb-2">
            <div className="w-1/6">
              <DropdownTemplate
                {...{
                  templatesToShow,
                  settings,
                  activeTemplate,
                  setError,
                  setActiveTemplate,
                }}
              />
            </div>
            {templateSettings.optionalWidgets.includes(WIDGET_HEADER) && (
              <>
                <div className="w-2/3">
                  <Input
                    placeholder="Header:"
                    data-test-id={TID.addTurn.field('header')}
                    value={form[FIELD_HEADER]}
                    onChange={(e) =>
                      formChangeHandler(FIELD_HEADER, e.target.value)
                    }
                  />
                </div>
                <div className="w-1/6">
                  <Switch
                    defaultChecked={true}
                    checked={!form[FIELD_DONT_SHOW_HEADER]}
                    onChange={(checked) => {
                      formChangeHandler(FIELD_DONT_SHOW_HEADER, !checked);
                    }}
                  />
                </div>
              </>
            )}
          </div>
          <div className="panel-flex mb-2">
            <div className="w-7/12">
              <Input
                placeholder="Source URL:"
                data-test-id={TID.addTurn.field('source')}
                value={form[FIELD_SOURCE]}
                onChange={(e) =>
                  formChangeHandler(FIELD_SOURCE, e.target.value)
                }
              />
            </div>
            <div className="w-1/4">
              <DatePicker
                value={form[FIELD_DATE] ? dayjs(form[FIELD_DATE]) : null}
                data-test-id={TID.addTurn.field('date')}
                style={{ width: '100%' }}
                onChange={(d) =>
                  formChangeHandler(FIELD_DATE, d?.format('YYYY-MM-DD'))
                }
              />
            </div>
          </div>

          {!!error && <div className="alert alert-danger">{error.message}</div>}
        </div>
        <Component />
      </div>
      </>
    );
  }

  return (
    <>
      <EditorPanelSplit />
      <div
        className={`panel-inner flex flex-col h-full flex-1`}
      >
        {!isMaximized && (
          <>
            <div className="panel-cell">
              <div className="panel-flex mb-2">
                <div className="w-1/6">
                  <DropdownTemplate
                    {...{
                      templatesToShow,
                      settings,
                      activeTemplate,
                      setError,
                      setActiveTemplate,
                    }}
                  />
                </div>
                <div className="w-2/3">
                  <Input
                    placeholder="Header:"
                    data-test-id={TID.addTurn.field('header')}
                    value={form[FIELD_HEADER]}
                    onChange={(e) =>
                      formChangeHandler(FIELD_HEADER, e.target.value)
                    }
                  />
                </div>
                <div>
                  <Switch
                    defaultChecked={true}
                    checked={!form[FIELD_DONT_SHOW_HEADER]}
                    onChange={(checked) => {
                      formChangeHandler(FIELD_DONT_SHOW_HEADER, !checked);
                    }}
                  />
                </div>
              </div>
              <div className="panel-flex mb-2">
                <div className="w-7/12">
                  <Input
                    placeholder="Source URL:"
                    data-test-id={TID.addTurn.field('source')}
                    value={form[FIELD_SOURCE]}
                    onChange={(e) =>
                      formChangeHandler(FIELD_SOURCE, e.target.value)
                    }
                  />
                </div>
                <div className="w-1/4">
                  <DatePicker
                    value={form[FIELD_DATE] ? dayjs(form[FIELD_DATE]) : null}
                    data-test-id={TID.addTurn.field('date')}
                    style={{ width: '100%' }}
                    onChange={(d) =>
                      formChangeHandler(FIELD_DATE, d?.format('YYYY-MM-DD'))
                    }
                  />
                </div>
              </div>
              {fieldsToShow
                .filter((field) => {
                  if (
                    !fieldSettings[field].special &&
                    !fieldSettings[field].separate
                  ) {
                    return true;
                  }
                  return availableFields.includes(field);
                })
                .map((field) => {
                  return (
                    <FormInput
                      changeHandler={(value) => formChangeHandler(field, value)}
                      label={fieldSettings[field].label}
                      prefixClass={fieldSettings[field].prefixClass}
                      inputType={fieldSettings[field].inputType}
                      key={field}
                      value={form[field] || ''}
                      widgetSettings={fieldSettings[field].widgetSettings}
                      form={form}
                      patchForm={patchForm}
                      edition={edition}
                    />
                  );
                })}
              {!!error && (
                <div className="alert alert-danger">{error.message}</div>
              )}
            </div>
          </>
        )}
        <div
          className="flex-1 quill-wrapper panel-cell mt-0"
          style={{ '--editor-font-size': `${fontSize}px` }}
          data-font-size={fontSize}
        >
          <div id="toolbar-container-new">
            <span className="ql-formats">
              <select className="ql-background">
                {[
                  '',
                  'rgb(255, 255, 0)',
                  'rgb(138, 255, 36)',
                  'rgb(253, 201, 255)',
                  'rgb(156, 245, 255)',
                  'rgb(210, 211, 212)',
                  'rgb(255, 213, 150)',
                ].map((val, i) => (
                  <option value={val} key={i} />
                ))}
              </select>
              <button
                className="ql-bold"
                data-test-id={TID.addTurn.toolbar('bold')}
              />
              <button
                className="ql-italic"
                data-test-id={TID.addTurn.toolbar('italic')}
              />
              <button className="ql-link" />
            </span>
          </div>
          <div id="editor-container-new" />
        </div>
        <div className="panel-cell">
          <div className="panel-flex panel-buttons">
            <button
              className="btn btn-primary btn-accent"
              data-test-id={TID.addTurn.save}
              data-save-state={saveState}
              disabled={saveState !== 'ready'}
              title={SAVE_HINTS[saveState]}
              onClick={(e) => saveHandler(e)}
            >
              {saveState === 'checking' ? 'Checking…' : 'Save'}
            </button>
            <button
              className="btn btn-primary"
              data-test-id={TID.addTurn.cancel}
              onClick={(e) => hidePanel()}
            >
              Cancel
            </button>

            <button
              className="btn btn-primary"
              data-test-id={TID.addTurn.format}
              onClick={() => formatHandler()}
            >
              Format
            </button>

            <PanelButton
              data-test-id={TID.addTurn.fontDec}
              title="Smaller text in the editor"
              disabled={fontSize <= EDITOR_FONT_SIZE_MIN}
              onClick={() => changeFontSize(-EDITOR_FONT_SIZE_STEP)}
            >
              A−
            </PanelButton>
            <PanelButton
              data-test-id={TID.addTurn.fontInc}
              title="Larger text in the editor"
              disabled={fontSize >= EDITOR_FONT_SIZE_MAX}
              onClick={() => changeFontSize(EDITOR_FONT_SIZE_STEP)}
            >
              A+
            </PanelButton>

            <div className="flex-1" />
            <button
              className="btn btn-primary"
              style={{ width: '90px' }}
              onClick={(e) => toggleMaximize(isMaximized ? false : true)}
            >
              {!isMaximized ? 'Maximize' : 'Back'}
            </button>
          </div>
        </div>
      </div>

      {/* Замена файла уносит цитаты старого и связи, которые на них держались.
          Окно контролируемое, а не Modal.confirm: статические методы
          antd не видят контекст темы, а нам всё равно нужно своё состояние —
          в нём лежит уже собранное сохранение. */}
      <Modal
        open={!!orphanConfirm}
        title="Заменяется файл — цитаты будут удалены"
        okText="Удалить и сохранить"
        cancelText="Отмена"
        okButtonProps={{ danger: true }}
        onCancel={() => setOrphanConfirm(null)}
        onOk={() => {
          const { payload } = orphanConfirm;
          setOrphanConfirm(null);
          commitSave(payload);
        }}
      >
        {!!orphanConfirm && (
          <>
            <p>
              Цитаты привязаны к содержимому файла — к его страницам, областям и
              секундам. После замены им не на что указывать, поэтому они
              удаляются вместе со связями, которые на них держались.
            </p>
            <p className="mb-0">
              Будет удалено цитат: <b>{orphanConfirm.summary.quotesCount}</b> (
              {orphanConfirm.summary.byWidget}), связей:{' '}
              <b>{orphanConfirm.summary.linesCount}</b>.
            </p>
          </>
        )}
      </Modal>

      {/* Следующая проверка или окно цитат — в afterClose: следом, а не поверх. */}
      <Modal
        open={!!notMediaConfirm}
        title={notMediaText.title}
        okText="Сохранить всё равно"
        cancelText="Отмена"
        okButtonProps={{ 'data-test-id': TID.addTurn.notMediaSave }}
        cancelButtonProps={{ 'data-test-id': TID.addTurn.notMediaCancel }}
        onCancel={() => setNotMediaConfirm(null)}
        onOk={() => {
          confirmedNotMedia.current = notMediaConfirm;
          setNotMediaConfirm(null);
        }}
        afterClose={() => {
          const confirmed = confirmedNotMedia.current;
          confirmedNotMedia.current = null;
          if (confirmed) {
            checkMediaLinks(
              confirmed.rest,
              confirmed.payload,
              confirmed.orphanSummary,
            );
          }
        }}
      >
        {!!notMediaConfirm && (
          <div
            data-test-id={TID.addTurn.notMedia}
            data-field={notMediaConfirm.name}
            data-reason={notMediaConfirm.reason}
          >
            <p>
              Ссылка {notMediaText.inField}{' '}
              {notMediaConfirm.reason === 'type'
                ? 'ведёт на файл другого типа.'
                : `не открылась ${notMediaText.asType}.`}{' '}
              {notMediaText.result}
            </p>
            <p className="mb-0" style={{ wordBreak: 'break-all' }}>
              {notMediaConfirm.url}
            </p>
          </div>
        )}
      </Modal>

      <Modal
        open={!!formatConfirm}
        title="Format снимет оформление абзаца"
        okText="Отформатировать"
        cancelText="Отмена"
        okButtonProps={{
          danger: !!formatConfirm?.quotes,
          'data-test-id': TID.addTurn.formatConfirm,
        }}
        onCancel={() => setFormatConfirm(null)}
        onOk={() => {
          setFormatConfirm(null);
          applyFormat();
        }}
      >
        {!!formatConfirm && (
          <>
            <p>
              Format переклеивает переносы и лишние пробелы и оставляет от абзаца
              голый текст. Цитаты пропадут из хода при сохранении — вместе со
              связями, которые на них держались.
            </p>
            <p className="mb-0">
              Будет снято: цитат <b>{formatConfirm.quotes}</b>, ссылок{' '}
              <b>{formatConfirm.links}</b>, фрагментов с выделением{' '}
              <b>{formatConfirm.marked}</b>.
            </p>
          </>
        )}
      </Modal>
    </>
  );
};

export default AddEditTurnPopup;
