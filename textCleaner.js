const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, './text.txt');

const text = fs.readFileSync(filePath, 'utf8');

const MARKER = '~^@~';

const format = (text) => {
  const text1 = text.replaceAll(/(\n|\r\n)\s/gm, MARKER);
  const text2 = text1.replaceAll(/(\n|\r\n)/gm, ' ');
  const text3 = text2.replaceAll(MARKER, '\n');
  return text3;
};

console.log(format(text));
