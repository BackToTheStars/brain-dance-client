import Quill from 'quill';
const colorModule = Quill.import('attributors/class/color');
const Delta = Quill.import('delta');
const Parchment = Quill.import('parchment');
// @todo: refactoring

Quill.register(colorModule, true);
Quill.register(Delta, true);

// Имя в дельте — id: так лежат сохранённые ходы. Без регистрации Quill о нём не знает,
// теряет его на новом блоте (жирный) и склеивает соседние цитаты одного цвета.
const QUOTE_ID_ATTRIBUTE = 'data-quote-id';
Quill.register(
  new Parchment.Attributor('id', QUOTE_ID_ATTRIBUTE, {
    scope: Parchment.Scope.INLINE,
  }),
  true,
);

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
    const ops = quill.getContents().ops;
    //console.log(`getQuillTextArr: ${JSON.stringify(ops)}`);
    return ops;
  };

  return {
    quill,
    getQuillTextArr,
  };
};

// Элементы редактора с фоном — ими помечены текстовые цитаты. Фон Quill ставит
// атрибутом стиля, а не отдельным блотом: у голого текста получается span, а внутри
// жирного, курсива или ссылки фон ложится прямо на strong / em / a, и выборка по span
// такую цитату теряла бы. Вложенные повторы отбрасываем: цитата — одна на фрагмент.
const getQuoteElements = (containerSelector = '#editor-container-new') => {
  const root = document.querySelector(`${containerSelector} .ql-editor`);
  if (!root) return [];
  const withBackground = [...root.querySelectorAll('*')].filter(
    (el) => !!el.style?.backgroundColor,
  );
  return withBackground.filter(
    (el) => !withBackground.some((other) => other !== el && other.contains(el)),
  );
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

export {
  getQuill,
  getQuoteElements,
  checkIfParagraphExists,
  paragraphToString,
  QUOTE_ID_ATTRIBUTE,
};
