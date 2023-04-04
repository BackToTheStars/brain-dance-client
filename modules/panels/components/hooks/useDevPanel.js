import { useSelector } from 'react-redux';
import { PANEL_DEVELOPER_MODE } from '../../settings';

const items = {
  window: { 0: null },
};

class DevItem {
  constructor(id, { x, y, w, h, itemType }, { parentType, parentId }) {
    this.parentId = parentId;
    this.parentType = parentType;
  }

  getParent() {
    return getDevItem(this.parentType, this.parentId);
  }
}

const setDevItem = (itemType, id, params, parentType, parentId) => {
  if (!items[itemType]) {
    items[itemType] = {};
  }
  items[itemType][id] = new DevItem(
    id,
    { itemType, ...params },
    { parentType, parentId }
  );
};

setDevItem('window', '0', { x: 0, y: 0, w: 0, h: 0 }, 'window', '0');

const getDevItems = () => {
  return items;
};

const getDevItem = (type, id) => {
  return items[type][id];
};

if (typeof window !== 'undefined') {
  window.getDevItems = getDevItems;
}

export const useDevPanel = () => {
  const isDisplayed = useSelector(
    (state) => state.panels.d[PANEL_DEVELOPER_MODE].isDisplayed
  );
  return { isDeveloperModeActive: isDisplayed, setDevItem };
};
