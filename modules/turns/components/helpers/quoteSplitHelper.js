// Жирный режет цитату на подряд идущие инсерты с одним фоном и одним id: атрибутор
// держит id на каждом куске. Цитатой остаётся левый кусок, у остальных снят фон.
// Соседки того же цвета с разными id — разные цитаты; куски без id — одна.

const quoteBackground = (op) => op?.attributes?.background;

const quoteIdKey = (op) => {
  const { id } = op.attributes;
  return id === undefined || id === null ? null : String(id);
};

const withoutQuote = (op) => {
  const { background, id, ...rest } = op.attributes;
  const { attributes, ...plain } = op;
  return Object.keys(rest).length ? { ...plain, attributes: rest } : plain;
};

export const collapseSplitQuotes = (ops) => {
  if (!Array.isArray(ops)) return [];

  const result = [...ops];
  let start = 0;

  while (start < ops.length) {
    const background = quoteBackground(ops[start]);
    if (!background) {
      start += 1;
      continue;
    }

    const id = quoteIdKey(ops[start]);
    let end = start + 1;
    while (
      end < ops.length &&
      quoteBackground(ops[end]) === background &&
      quoteIdKey(ops[end]) === id
    ) {
      result[end] = withoutQuote(ops[end]);
      end += 1;
    }

    start = end;
  }

  return result;
};

export default collapseSplitQuotes;
