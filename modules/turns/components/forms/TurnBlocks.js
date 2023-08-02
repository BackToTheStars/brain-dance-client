import { togglePanel } from '@/modules/panels/redux/actions';
import { PANEL_ADD_EDIT_TURN } from '@/modules/panels/settings';
import { useDispatch, useSelector } from 'react-redux';
import { HeaderEditForm } from '../widgets/header/EditForm';
import { Button, Dropdown } from 'antd';
import { CheckOutlined, CloseOutlined, DownOutlined } from '@ant-design/icons';
import {
  WIDGET_HEADER,
  WIDGET_PARAGRAPH,
  WIDGET_PICTURE,
  WIDGET_SOURCE,
  WIDGET_VIDEO,
  widgetSettings,
} from '../../settings';
import React, { useState } from 'react';
import { WidgetBlockComponent } from './turnBlocks/WidgetBlock';

// Кнопки для всей формы
const Buttons = () => {
  const dispatch = useDispatch();
  const hidePanel = () => {
    dispatch(togglePanel({ type: PANEL_ADD_EDIT_TURN }));
  };
  return (
    <>
      <button
        className="btn btn-primary"
        // id="cancel-turn-modal"
        onClick={(e) => hidePanel()}
      >
        Cancel
      </button>
    </>
  );
};

// Форма создания хода
const CreateTurnForm = () => {
  const [widgetToAdd, setWidgetToAdd] = useState(WIDGET_HEADER);
  const [widgetBlocks, setWidgetBlocks] = useState([]);
  const [dWidgetIds, setDWidgetIds] = useState({});
  const [addWidgetBlockPos, setAddWidgetBlockPos] = useState(null);

  const items = [
    WIDGET_HEADER,
    WIDGET_PICTURE,
    WIDGET_PARAGRAPH,
    WIDGET_VIDEO,
    WIDGET_SOURCE,
  ].map((item) => ({
    key: item,
    label: (
      <a
        href="#"
        style={{ paddingLeft: '10px' }}
        onClick={(e) => {
          e.preventDefault();
          setWidgetToAdd(item);
        }}
      >
        {widgetSettings[item].label}
      </a>
    ),
  }));

  const addWidgetBlock = (position) => {
    // @todo: изменить подсчёт при редактировании хода
    let widgetId = (dWidgetIds[widgetToAdd] || 0) + 1;
    setDWidgetIds({ ...dWidgetIds, [widgetToAdd]: widgetId });
    setWidgetBlocks([
      ...widgetBlocks.slice(0, position),
      {
        type: widgetToAdd,
        id: `${widgetSettings[widgetToAdd].prefix}_${widgetId}`,
        ...widgetSettings[widgetToAdd].defaultParams, // @todo: сделать копию внутренних полей
      },
      ...widgetBlocks.slice(position),
    ]);
    setAddWidgetBlockPos(null);
  };

  const moveUpWidgetBlock = (id) => {
    const index = widgetBlocks.findIndex((widget) => widget.id === id);
    if (!index) return;
    const widgets = [...widgetBlocks];
    const tmp = widgets[index];
    widgets[index] = widgets[index - 1];
    widgets[index - 1] = tmp;
    // [widgets[index], widgets[index - 1]] = [widgets[index - 1], widgets[index]];
    setWidgetBlocks(widgets);
  };

  const moveDownWidgetBlock = (id) => {
    const index = widgetBlocks.findIndex((widget) => widget.id === id);
    if (index === widgetBlocks.length - 1) return;
    const widgets = [...widgetBlocks];
    const tmp = widgets[index];
    widgets[index] = widgets[index + 1];
    widgets[index + 1] = tmp;
    // [widgets[index], widgets[index - 1]] = [widgets[index - 1], widgets[index]];
    setWidgetBlocks(widgets);
  };

  const deleteWidgetBlock = (id) => {
    setWidgetBlocks(widgetBlocks.filter((widget) => widget.id !== id));
  };

  const updateWidgetBlock = (widgetBlock) => {
    setWidgetBlocks(
      widgetBlocks.map((block) => {
        if (block.id !== widgetBlock.id) return block;
        return widgetBlock;
      })
    );
  };

  const AddWidgetComponent = ({ position }) => {
    return (
      <div className="panel-flex mb-2">
        <div className="col-sm-2">
          <Dropdown menu={{ items }} trigger="click" placement="bottomLeft">
            <Button
              className="w-100"
              style={{
                color: 'rgb(255, 255, 255)',
                backgroundColor: '#1b4d76',
                borderColor: '#667480',
                opacity: 0.65,
              }}
            >
              {widgetSettings[widgetToAdd].label}
            </Button>
          </Dropdown>
          <div>
            <Button onClick={() => addWidgetBlock(position)}>
              <CheckOutlined />
            </Button>
            <Button onClick={() => setAddWidgetBlockPos(null)}>
              <CloseOutlined />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const actions = {
    setAddWidgetBlockPos,
    moveUpWidgetBlock,
    moveDownWidgetBlock,
    deleteWidgetBlock,
  };

  return (
    <>
      {widgetBlocks.map((widgetBlock, index) => {
        if (index === addWidgetBlockPos) {
          return (
            <React.Fragment key={widgetBlock.id}>
              <WidgetBlockComponent
                widgetBlock={widgetBlock}
                index={index}
                updateWidgetBlock={updateWidgetBlock}
                actions={actions}
              />
              <AddWidgetComponent position={index + 1} />
            </React.Fragment>
          );
        }
        return (
          <WidgetBlockComponent
            key={widgetBlock.id}
            widgetBlock={widgetBlock}
            index={index}
            updateWidgetBlock={updateWidgetBlock}
            actions={actions}
          />
        );
      })}
      {!widgetBlocks.length && <AddWidgetComponent position={0} />}
      <pre>{JSON.stringify(widgetBlocks, null, 2)}</pre>
    </>
  );
};

// Форма обновления хода
const UpdateTurnForm = () => {
  const editTurnId = useSelector((state) => state.panels.editTurnId);
  // const turn = useSelector((state) => state.turns.d[editTurnId]);
  const items = ['header', 'picture', 'video', 'source', 'paragraph'].map(
    (item) => ({ key: item, label: item })
  );
  return (
    <>
      <div>
        <div style={{ width: '200px' }}>
          <Dropdown menu={{ items }} trigger="click" placement="bottomLeft">
            <Button
              className="w-100"
              style={{
                color: 'rgb(255, 255, 255)',
                backgroundColor: '#1b4d76',
                borderColor: '#667480',
                opacity: 0.65,
              }}
            >
              widgets
              <DownOutlined style={{ fontSize: '15px' }} />
            </Button>
          </Dropdown>
        </div>

        {/* [header, picture, video, source?, paragraph + compressed] */}
        <hr />
        <HeaderEditForm turnId={editTurnId} widgetId="h_1" />
      </div>
      <div>
        Common Turn Fields
        <br />
        _id: {editTurnId}
        (_id, originalId)
        <br />
        (contentType, date, sourceUrl)
        <br />
        (colors)
        <br />
      </div>
      <hr />
      <div>
        Geometry
        <br />
        (position)
        <br />
        (size)
        <br />
      </div>
      <hr />
      <div>
        Quotes
        <br />
        (image quotes)
        <br />
        (paragraph quotes)
        <br />
      </div>
      <hr />
    </>
  );
};

// Основной компонент
const TurnBlocksForm = () => {
  const editTurnId = useSelector((state) => state.panels.editTurnId);
  const FormComponent = editTurnId ? UpdateTurnForm : CreateTurnForm;

  return (
    <div
      className="panel-inner d-flex flex-column h-100 flex-1 add-edit-form"
      style={{
        overflowY: 'auto',
        padding: '20px',
        overflowX: 'hide',
      }}
    >
      <div className="flex-1">
        <FormComponent />
      </div>
      <div>
        <Buttons />
      </div>
    </div>
  );
};

export default TurnBlocksForm;
