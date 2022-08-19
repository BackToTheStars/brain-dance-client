import Quill from 'quill';
const colorModule = Quill.import('attributors/class/color');

Quill.register(colorModule, true);

const getQuill = (containerSelector, toolbarSelector) => {
  const quill = new Quill(containerSelector, {
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

const checkIfParagraphExists = (paragraph) => {
  return !!paragraph
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
