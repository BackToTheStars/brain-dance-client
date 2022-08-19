// словарь соответствия цветов для комментария
const d = {
  '#eced9a': 'rgb(176, 177, 94)',
};

export const getCommentHeaderColor = (baseColor) => {
  if (d[baseColor]) return d[baseColor];
  return baseColor;
};
