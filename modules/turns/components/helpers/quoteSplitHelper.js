// Жирный режет цитату на подряд идущие инсерты с одним фоном: фон Quill держит
// стилем на ближайшем inline-элементе, а не блотом. Цитатой остаётся левый
// кусок и забирает прежний id — на нём висят линии; кусок с другим прежним id —
// отдельная цитата, её не трогаем.

const quoteBackground = (op) => op?.attributes?.background;

const withoutQuote = (op) => {
  const { background, id, ...rest } = op.attributes;
  const { attributes, ...plain } = op;
  return Object.keys(rest).length ? { ...plain, attributes: rest } : plain;
};

const withQuoteId = (op, id) =>
  id === undefined || id === op.attributes.id
    ? op
    : { ...op, attributes: { ...op.attributes, id } };

export const collapseSplitQuotes = (ops, prevQuoteIds = []) => {
  if (!Array.isArray(ops)) return [];

  const known = new Set((prevQuoteIds || []).map((id) => String(id)));
  const result = [...ops];
  let start = 0;

  while (start < ops.length) {
    const background = quoteBackground(ops[start]);
    if (!background) {
      start += 1;
      continue;
    }

    let end = start + 1;
    while (end < ops.length && quoteBackground(ops[end]) === background) end += 1;

    if (end - start > 1) {
      const survivors = [];
      for (let i = start; i < end; i += 1) {
        const { id } = ops[i].attributes;
        if (id === undefined || id === null || !known.has(String(id))) continue;
        if (survivors.some((item) => String(item.id) === String(id))) continue;
        survivors.push({ id, index: survivors.length ? i : start });
      }

      const keep = new Map(survivors.map(({ id, index }) => [index, id]));
      if (!keep.has(start)) keep.set(start, ops[start].attributes.id);

      for (let i = start; i < end; i += 1) {
        result[i] = keep.has(i)
          ? withQuoteId(ops[i], keep.get(i))
          : withoutQuote(ops[i]);
      }
    }

    start = end;
  }

  return result;
};

export default collapseSplitQuotes;
