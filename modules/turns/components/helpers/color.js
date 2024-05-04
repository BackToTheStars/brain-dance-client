const ORANGE = '#ffd596';
const GRAY = '#d2d3d4';
const PINK = '#fdc9ff';
const LIGHT_BLUE = '#9cf5ff';
const GREEN = '#8aff24';
const YELLOW = '#ffff00';

export const colorSet = {};
colorSet.turn = {
  [ORANGE]: '#8f480d',
  [GRAY]: '#525354',
  [PINK]: '#85176d',
  [LIGHT_BLUE]: '#1f717a',
  [GREEN]: '#3f6e17',
  [YELLOW]: '#87862b',
};
colorSet.comment = {
  [ORANGE]: '#edb193',
  [GRAY]: '#d2d3d4',
  [PINK]: '#fdc9ff',
  [LIGHT_BLUE]: '#9cf5ff',
  [GREEN]: '#8aff24',
  [YELLOW]: '#ffff00',
};

const contrastSettings = {};
export const getNeedBlackText = (backgroundColor) => {
  if (contrastSettings[backgroundColor])
    return contrastSettings[backgroundColor];
  const color = backgroundColor.replace('#', '');
  const rgb = parseInt(color, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const brightness = r * 0.299 + g * 0.587 + b * 0.114;
  contrastSettings[backgroundColor] = brightness > 150;
  return contrastSettings[backgroundColor];
};
