import { useSelector } from 'react-redux';
import { PANEL_DEVELOPER_MODE } from '../../settings';

const items = {
  window: { 0: null },
};

class DevItem {
  constructor(
    id,
    { x, y, w, h, itemType, selector },
    { parentType, parentId }
  ) {
    this.parentId = parentId;
    this.parentType = parentType;
    this.itemType = itemType;
    this.selector = selector;
    this.selfInfo = {
      x: Math.round(x),
      y: Math.round(y),
      w: Math.round(w),
      h: Math.round(h),
    };
  }

  getParent() {
    return getDevItem(this.parentType, this.parentId);
  }

  showTelemetry() {
    if (!this.selector) {
      console.log('No selector given');

      return;
    }
    const domElement = document.querySelector(this.selector);
    let { x, y, width: w, height: h } = domElement.getBoundingClientRect();
    x = Math.round(x);
    y = Math.round(y);
    w = Math.round(w);
    h = Math.round(h);

    let currentNode = this;
    let addedTop = 0;

    while (currentNode.itemType !== 'window') {
      addedTop = addedTop + currentNode.selfInfo.y;
      currentNode = currentNode.getParent();
    }

    console.log({
      viewportInfo: { x, y, w, h },
      addedTop,
      selfInfo: this.selfInfo,
      domElement,
    });
  }
}

/**
 * @param itemType тип элемента
 */
const setDevItem = ({ itemType, id, params, parentType, parentId }) => {
  if (!items[itemType]) {
    items[itemType] = {};
  }
  items[itemType][id] = new DevItem(
    id,
    { itemType, ...params },
    { parentType, parentId }
  );
};

setDevItem({
  itemType: 'window',
  id: '0',
  params: { x: 0, y: 0, w: 0, h: 0 },
  parentType: 'window',
  parentId: '0',
});

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
