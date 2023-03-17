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
    .replaceAll(/\!—/gm, ', —')
    .replaceAll(/( )+/gm, ' ')
    .replaceAll(/(\n){2,}/gm, '\n\n');
  // .replaceAll(
  //   /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/gm,
  //   '<a href="$&" target="_blank">$&</a>'
  // );

  return text1;
};
