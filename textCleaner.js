const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, './text.txt');

const text = fs.readFileSync(filePath, 'utf8');
// ([a-zA-Z0-9()]{1,}){1,}\.(ru|com|net|org|eu)

const MARKER = '~^@~';

const format = (text) => {
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

console.log(format(text));
