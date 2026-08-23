import { GRID_CELL_X } from "./ui";

export const TURN_SIZE_MIN_WIDTH = GRID_CELL_X * 12;
// 250 клеток по 24 px = 6000 px (BP-28). Потолок живёт только здесь и только в
// клиенте: серверной валидации ширины хода нет вовсе, ограничивает он ровно одно
// место — maxWidth у jQuery-UI resizable в `modules/turns/components/Turn.js`.
export const TURN_SIZE_MAX_WIDTH = GRID_CELL_X * 250;
export const TURN_SIZE_WIDTH = 800;
export const TURN_SIZE_HEIGHT = 600;

// Какие цитаты привязаны к содержимому какого файла хода (BP-26).
//
// Цитата задана в координатах конкретного файла: прямоугольные (картинка, pdf) —
// в процентах от его геометрии, таймлайновые (видео, аудио) — отрезками его
// длительности. Значит замена или удаление файла обесценивает все цитаты этого
// виджета: они начинают указывать на страницы и секунды, которых больше нет.
// Один список на все типы — новый тип медиа добавляется строкой сюда, а не
// отдельной проверкой в форме хода.
//
// `quoteType` — тип в плоском массиве `turn.quotes` (картинка, pdf). У таймлайнов
// цитаты лежат отдельным полем хода (`turn.videoQuotes` / `turn.audioQuotes`),
// поэтому у них `timelineWidgetId` (ключ в `dWidgets`) и `timelineField` — поле,
// которое надо обнулить, чтобы виджет ушёл целиком (как в deleteVideoQuotesWidget).
// Значения строками, а не константами: этот файл ничего не импортирует, кроме
// `./ui` (см. CLAUDE.md про циклические импорты), и так же строками их пишет
// `TurnHelper.toNewFields`.
export const TURN_MEDIA_QUOTE_BINDINGS = [
  { field: 'imageUrl', label: 'картинка', quoteType: 'picture' },
  { field: 'pdfUrl', label: 'pdf', quoteType: 'pdf' },
  {
    field: 'videoUrl',
    label: 'видео',
    timelineWidgetId: 'vq_1',
    timelineField: 'videoQuotes',
  },
  {
    field: 'audioUrl',
    label: 'аудио',
    timelineWidgetId: 'aq_1',
    timelineField: 'audioQuotes',
  },
];
