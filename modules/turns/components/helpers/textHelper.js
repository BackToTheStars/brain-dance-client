const MARKER = '~^@~';

export const cleanText = (text) => {
  const text1 = text
    .replaceAll(/(\n|\r\n)\s/gm, MARKER)
    .replaceAll(/(\n|\r\n)/gm, ' ')
    .replaceAll(MARKER, '\n\n')
    .replaceAll(/(\n).( )+/gm, '\n\t')
    .replaceAll(/\-\-/gm, '—')
    .replaceAll(/\.—/gm, '. —')
    .replaceAll(/\,—/gm, ', —')
    .replaceAll(/\!—/gm, '! —')
    .replaceAll(/( )+/gm, ' ')
    .replaceAll(/(\n){2,}/gm, '\n\n');
  // .replaceAll(
  //   /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/gm,
  //   '<a href="$&" target="_blank">$&</a>'
  // );

  return text1;
};

// Что снимет Format: он заменяет содержимое плоским текстом, то есть теряет все
// атрибуты дельты. Цитаты считаются по фону — так они и помечаются.
export const getFormatLoss = (inserts = []) => {
  const loss = { quotes: 0, links: 0, marked: 0 };

  for (const item of inserts) {
    const attributes = item?.attributes;
    if (!attributes) continue;
    if (attributes.background) loss.quotes += 1;
    if (attributes.link) loss.links += 1;
    if (attributes.bold || attributes.italic) loss.marked += 1;
  }
  loss.total = loss.quotes + loss.links + loss.marked;

  return loss;
};
