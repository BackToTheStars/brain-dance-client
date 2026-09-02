// Ссылка входа в игру из лобби. Ход в query нужен там, где переход осмыслен от
// конкретного хода: холст откроется с вьюпортом на нём.
export const getGameUrl = (hash, turnId = null) =>
  `/game?hash=${hash}${turnId ? `&turn=${turnId}` : ''}`;
