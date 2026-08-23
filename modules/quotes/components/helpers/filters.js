import { TURN_MEDIA_QUOTE_BINDINGS } from '@/config/turn';

// Цитаты, которые обесценит сохранение хода: у виджета меняется файл, а цитаты
// заданы в координатах старого (BP-26). Возвращает список по виджетам — форме
// нужен и счётчик для предупреждения, и сами цитаты, чтобы убрать их из хода
// (линии за ними подчистит общий путь через filterQuotesDeleted).
//
// prevFields / nextFields — ход в старом формате (`imageUrl`, `pdfUrl`, …):
// «было» из стора и «станет» из формы. Сравниваются именно они, поэтому одно
// правило накрывает все три случая: файл заменили, файл убрали, сменили тип хода
// (тогда чужие поля обнуляются в preparedForm).
// getTimelineQuotes(widgetId) — цитаты таймлайна: они лежат не в `quotes`,
// а в `turn.videoQuotes` / `turn.audioQuotes`.
export const filterQuotesOrphanedByMedia = ({
  prevFields,
  nextFields,
  prevQuotes = [],
  getTimelineQuotes = () => [],
}) => {
  const orphaned = [];

  for (const binding of TURN_MEDIA_QUOTE_BINDINGS) {
    const prevUrl = prevFields?.[binding.field] || '';
    const nextUrl = nextFields?.[binding.field] || '';
    // файла не было — привязывать цитаты было не к чему; не менялся — цитаты валидны
    if (!prevUrl || prevUrl === nextUrl) continue;

    const quotes = binding.quoteType
      ? prevQuotes.filter((quote) => quote.type === binding.quoteType)
      : getTimelineQuotes(binding.timelineWidgetId) || [];

    if (!quotes.length) continue;
    orphaned.push({ ...binding, quotes });
  }

  return orphaned;
};

export const filterQuotesDeleted = (prevTurnQuotes, newTurnQuotes) => {
  //
  const d = {};
  const quotesDeleted = [];

  for (let quote of newTurnQuotes) {
    d[quote.id] = true;
  }

  for (let quote of prevTurnQuotes) {
    if (!d[quote.id]) quotesDeleted.push(quote);
  }

  return quotesDeleted;
};
