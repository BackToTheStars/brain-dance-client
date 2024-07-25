import { togglePanel } from '@/modules/panels/redux/actions';
import { PANEL_ADD_EDIT_TURN } from '@/modules/panels/settings';
import { useDispatch, useSelector } from 'react-redux';
import { HeaderEditForm } from '../widgets/header/EditForm';
import { Button, Carousel, Dropdown } from 'antd';
import { CheckOutlined, CloseOutlined, DownOutlined } from '@ant-design/icons';
import turnSettings, {
  WIDGET_HEADER,
  WIDGET_PARAGRAPH,
  WIDGET_PICTURE,
  WIDGET_SOURCE,
  WIDGET_VIDEO,
  widgetSettings,
} from '../../settings';
import React, { useState } from 'react';
import { WidgetBlockComponent } from './turnBlocks/WidgetBlock';
import DropdownTemplate from '../inputs/DropdownTemplate';
import Picture from '../widgets/picture/Picture';
import Video from '../widgets/Video';
import Paragraph from 'antd/es/skeleton/Paragraph';
import { TURN_SIZE_HEIGHT, TURN_SIZE_WIDTH } from '@/config/turn';

const { templatesToShow, settings } = turnSettings;

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

const validateAvailableWidgets = (widgetBlocks, availableWidgets) => {
  const widgetsCount = {};
  for (const widgetBlock of widgetBlocks) {
    if (!widgetsCount[widgetBlock.type]) {
      widgetsCount[widgetBlock.type] = 0;
    }
    widgetsCount[widgetBlock.type] += 1;
  }
  for (const widgetName in widgetsCount) {
    if (availableWidgets[widgetName].max < widgetsCount[widgetName]) {
      return [
        false,
        `max amount of ${widgetName} is ${availableWidgets[widgetName].max}`,
      ];
    }
  }
  for (const widgetName in availableWidgets) {
    if (!availableWidgets[widgetName].min) continue;
    if (availableWidgets[widgetName].min > (widgetsCount[widgetName] || 0)) {
      return [
        false,
        `min amount of ${widgetName} is ${availableWidgets[widgetName].min}`,
      ];
    }
  }
  return [true];
};

// Форма создания хода
const CreateTurnForm = () => {
  const [widgetToAdd, setWidgetToAdd] = useState(WIDGET_HEADER);
  const [widgetBlocks, setWidgetBlocks] = useState([]);
  const [dWidgetIds, setDWidgetIds] = useState({});
  const [addWidgetBlockPos, setAddWidgetBlockPos] = useState(null);
  const [errors, setErrors] = useState({});
  const [activeTemplate, setActiveTemplate] = useState(templatesToShow[0]);
  const templateSettings = settings[activeTemplate];
  const gamePosition = useSelector((state) => state.game.position);

  const commonFields = {
    colors: {
      background: null,
      font: null,
    },
    position: {
      // @todo: get vieport size from redux
      x:
        gamePosition.x +
        Math.round(window.innerWidth / 2 - TURN_SIZE_WIDTH / 2),
      y:
        gamePosition.y +
        Math.round(window.innerHeight / 2 - TURN_SIZE_HEIGHT / 2),
    },
    size: {
      width: TURN_SIZE_WIDTH,
      height: TURN_SIZE_HEIGHT,
    },
  };

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

  const onSaveTurn = (e) => {
    e.preventDefault();
    const errors = {};
    for (const widgetBlock of widgetBlocks) {
      const validation = widgetSettings[widgetBlock.type].validation;
      if (!!validation) {
        const [success, message] = validation(widgetBlock);
        if (!success) {
          errors[widgetBlock.id] = message;
        }
      }
    }

    if (Object.values(errors).length !== 0) {
      setErrors(errors);
      return;
    }
    // доступные виджеты, мин и макс количество

    if (!!Object.values(templateSettings.availableWidgets || {}).length) {
      const [success, message] = validateAvailableWidgets(
        widgetBlocks.filter((w) => w.show),
        templateSettings.availableWidgets
      );
      if (!success) {
        errors.extra = message;
        setErrors(errors);
        return;
      }
    }

    // проверка шаблона по их правилам валидации, напр. есть ли картинка
    if (templateSettings.validation) {
      const [success, message] = templateSettings.validation(
        widgetBlocks.filter((w) => w.show)
      );
      if (!success) {
        errors.extra = message;
        setErrors(errors);
        return;
      }
    }

    setErrors({});

    const data = {
      ...commonFields,
      widgets: widgetBlocks,
      contentType: activeTemplate,
      gameId: '',
      quotes: [],
      widgetShownIds: widgetBlocks.map((i) => i.id),
    };
  };

  const onRearrange = () => {
    setWidgetBlocks(
      [...widgetBlocks].sort((a, b) => {
        const pos1 = templateSettings.widgetOrder.indexOf(a.type);
        const pos2 = templateSettings.widgetOrder.indexOf(b.type);
        if (pos1 > pos2) return 1;
        if (pos1 < pos2) return -1;
        if (pos1 === pos2) return 0;
      })
    );
  };

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
        <div className="w-1/6">
          <Dropdown menu={{ items }} trigger="click" placement="bottomLeft">
            <Button
              className="w-full"
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
      <div className="flex">
        <div className="w-1/4">
          <DropdownTemplate
            {...{
              templatesToShow,
              settings,
              activeTemplate: activeTemplate,
              setActiveTemplate: setActiveTemplate,
            }}
          />
        </div>
        <div className="w-3/4">
          <p style={{ fontSize: '16px' }} className="ps-2">
            {settings[activeTemplate].description}
          </p>
          {!!errors.extra && (
            <p style={{ fontSize: '16px' }} className="text-danger ps-2">
              {errors.extra}
            </p>
          )}
        </div>
      </div>
      {/* <div className="flex">{commonFields}</div> */}
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
              {!!errors[widgetBlock.id] && (
                <div className="text-red-400">{errors[widgetBlock.id]}</div>
              )}
            </React.Fragment>
          );
        }
        return (
          <React.Fragment key={widgetBlock.id}>
            <WidgetBlockComponent
              widgetBlock={widgetBlock}
              index={index}
              updateWidgetBlock={updateWidgetBlock}
              actions={actions}
            />
            {!!errors[widgetBlock.id] && (
              <div className="text-red-400">{errors[widgetBlock.id]}</div>
            )}
          </React.Fragment>
        );
      })}
      {!widgetBlocks.length && <AddWidgetComponent position={0} />}
      <button className="btn btn-primary" onClick={(e) => onSaveTurn(e)}>
        Save
      </button>
      {!!templateSettings?.widgetOrder?.length && (
        <button className="btn btn-primary" onClick={(e) => onRearrange(e)}>
          Rearrange
        </button>
      )}
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
              className="w-full"
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
      className="panel-inner flex flex-col h-full flex-1"
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
