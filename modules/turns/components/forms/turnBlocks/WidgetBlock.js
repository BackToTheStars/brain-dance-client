import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { widgetSettings } from '../../../settings';
import { Button } from 'antd';

// Левая часть блока виджета
export const WidgetMenu = ({ label, actions }) => {
  const { remove } = actions;
  return (
    <div className="flex flex-col">
      <div>{label}</div>
      <div className="">
        <Button onClick={actions.moveUp}>
          <ArrowUpOutlined />
        </Button>
        <Button onClick={actions.moveDown}>
          <ArrowDownOutlined />
        </Button>
        <Button onClick={actions.addBelow}>
          <PlusOutlined />
        </Button>
        <Button onClick={actions.remove}>
          <DeleteOutlined />
        </Button>
      </div>
    </div>
  );
};

// Весь блок виджета
export const WidgetBlockComponent = ({
  widgetBlock,
  index,
  updateWidgetBlock,
  actions,
}) => {
  const Component =
    widgetSettings[widgetBlock.type].componentToAdd ||
    (() => <>{widgetBlock.type}</>);

  return (
    <div className="panel-flex mb-2">
      <div className="w-1/4">
        {widgetBlock.id}
        <WidgetMenu
          label={widgetSettings[widgetBlock.type].label}
          actions={{
            addBelow: () => actions.setAddWidgetBlockPos(index),
            moveUp: () => actions.moveUpWidgetBlock(widgetBlock.id),
            moveDown: () => actions.moveDownWidgetBlock(widgetBlock.id),
            remove: () => actions.deleteWidgetBlock(widgetBlock.id),
          }}
        />
      </div>
      <div className="w-3/4">
        <Component
          widgetBlock={widgetBlock}
          updateWidgetBlock={updateWidgetBlock}
        />
      </div>
    </div>
  );
};
