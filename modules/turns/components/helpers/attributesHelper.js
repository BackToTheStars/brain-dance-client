// Атрибуты инсерта Quill → инлайновый стиль карточки хода. Без импортов: функция
// чистая и проверяется отдельно (brain-e2e, tests/unit).
//
// Жирный и курсив лежат в дельте флагами (`bold: true`), а `id` и `link` — служебные;
// объект атрибутов целиком в `style` класть нельзя: React выбрасывает флаги молча, а
// служебные поля утекают в стиль. Ключи фона и рамки добавляет сам рендер
// (modifyQuoteBackgrounds), поэтому они здесь тоже разрешены.
const STYLE_ATTRIBUTES = ['background', 'color', 'borderRadius', 'outline'];

export const attributesToStyle = (attributes) => {
  const style = {};
  if (!attributes || typeof attributes !== 'object') return style;

  for (const key of STYLE_ATTRIBUTES) {
    if (attributes[key] !== undefined && attributes[key] !== null) {
      style[key] = attributes[key];
    }
  }
  if (attributes.bold) style.fontWeight = 'bold';
  if (attributes.italic) style.fontStyle = 'italic';

  return style;
};

export default attributesToStyle;
