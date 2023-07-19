import { togglePanel } from '@/modules/panels/redux/actions';
import { PANEL_ADD_EDIT_TURN } from '@/modules/panels/settings';
import { useDispatch, useSelector } from 'react-redux';
import HeaderEditForm from '../widgets/header/EditForm';
import { Button, Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import {
  WIDGET_HEADER,
  WIDGET_PARAGRAPH,
  WIDGET_PICTURE,
  WIDGET_SOURCE,
  WIDGET_VIDEO,
  widgetSettings,
} from '../../settings';
import { useState } from 'react';

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

const CreateTurnForm = () => {
  const [widgetToAdd, setWidgetToAdd] = useState(WIDGET_HEADER);

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
  return (
    <>
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
        </div>
      </div>
    </>
  );
};

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

const TurnBlocksForm = () => {
  const editTurnId = useSelector((state) => state.panels.editTurnId);
  const FormComponent = editTurnId ? UpdateTurnForm : CreateTurnForm;

  return (
    <div className="panel-inner d-flex flex-column h-100 flex-1 add-edit-form">
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