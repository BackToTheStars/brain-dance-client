// Порядок наложения ходов: поле `z` хода, нет поля — 0; больший z лежит выше.
// Файл ничего не импортирует: его берут и редьюсер, и селекторы, и действия игры.

export const turnZ = (turn) =>
  typeof turn?.z === 'number' && Number.isFinite(turn.z) ? turn.z : 0;

// Устойчиво: при равных z остаётся прежний порядок.
export const sortIdsByZ = (ids, g) =>
  [...ids].sort((a, b) => turnZ(g[a]) - turnZ(g[b]));

const othersZ = (g, id) =>
  Object.keys(g)
    .filter((key) => key !== id)
    .map((key) => turnZ(g[key]));

// z, с которым ход ляжет над всеми остальными ходами игры; null — он уже выше всех.
export const frontZ = (g, id) => {
  const others = othersZ(g, id);
  const top = others.length ? Math.max(...others) : -Infinity;
  return turnZ(g[id]) > top ? null : top + 1;
};

// z, с которым ход ляжет под все остальные; null — он уже ниже всех.
export const backZ = (g, id) => {
  const others = othersZ(g, id);
  const bottom = others.length ? Math.min(...others) : Infinity;
  return turnZ(g[id]) < bottom ? null : bottom - 1;
};

// z нового хода: над всеми ходами игры.
export const newTurnZ = (g) => {
  const all = Object.keys(g).map((key) => turnZ(g[key]));
  return all.length ? Math.max(...all) + 1 : 0;
};
