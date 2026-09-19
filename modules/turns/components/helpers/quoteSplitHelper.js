// Жирный режет цитату на подряд идущие инсерты с одним фоном и одним id: атрибутор
// держит id на каждом куске. Цитатой остаётся левый кусок, у остальных снят фон.
// Соседки того же цвета с разными id — разные цитаты; куски без id — одна.
// Разрыв обычным текстом или другим фоном даёт тот же id уже не подряд: цитатой
// остаётся тот же левый кусок, правые повторы становятся обычным текстом — второй
// цитаты с этим id не бывает, иначе линии держались бы на двух кусках сразу.

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
  const taken = new Set();
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
      end += 1;
    }

    // id уже занят цитатой слева — этот кусок целиком становится обычным текстом
    const repeated = id !== null && taken.has(id);
    for (let i = repeated ? start : start + 1; i < end; i += 1) {
      result[i] = withoutQuote(ops[i]);
    }
    if (id !== null) taken.add(id);

    start = end;
  }

  return result;
};

export default collapseSplitQuotes;
