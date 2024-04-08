import Quill from 'quill';
const colorModule = Quill.import('attributors/class/color');
const Delta = Quill.import('delta');
// @todo: refactoring

Quill.register(colorModule, true);
Quill.register(Delta, true);

const lastRegisteredQuill = {};

const getQuill = (containerSelector, toolbarSelector) => {
  const domEl = document.querySelector(containerSelector);
  const containerExists =
    lastRegisteredQuill[containerSelector]?.domEl === domEl;
  const quill = containerExists
    ? lastRegisteredQuill[containerSelector].quill
    : new Quill(containerSelector, {
        // '#editor-container', {
        modules: {
          toolbar: {
            container: toolbarSelector, // '#toolbar-container',
            /*
           'align': [],
           'size': ['10px', '20px', '80px'],
           'color': ['#FFF', '#000', 'yellow'],
           */
            //[{background: ['#FFF', 'yellow']}]
          },
        },
        placeholder: 'Compose an epic...',
        theme: 'snow',
      });

  lastRegisteredQuill[containerSelector] = { domEl, quill };

  quill.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
    const ops = delta.ops.map((op) => ({ insert: op.insert }));
    return new Delta(ops);
  });

  const getQuillTextArr = () => {
    const ops = quill.editor.delta.ops;
    //console.log(`getQuillTextArr: ${JSON.stringify(ops)}`);
    return ops;
  };

  return {
    quill,
    getQuillTextArr,
  };
};

const checkIfParagraphExists = (inserts) => {
  return !!inserts
    .map((item) => item.insert)
    .join('')
    .trim(); // @todo: remove after quill fix
};

const paragraphToString = (paragraph, length = 200) => {
  const text = paragraph
    .map((item) => item.insert)
    .join('')
    .trim();

  return text.length > length ? `${text.slice(0, length)}...` : text;
};

export { getQuill, checkIfParagraphExists, paragraphToString };
