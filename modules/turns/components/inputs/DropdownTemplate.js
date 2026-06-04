import { Button, Dropdown, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import React from 'react';
import { TID } from '@/config/testIds';

const DropdownTemplate = ({
  templatesToShow,
  settings,
  activeTemplate,
  setError = () => {},
  setActiveTemplate,
}) => {
  const items = templatesToShow.map((el, i) => {
    const templateSettings = settings[el];
    return {
      key: i,
      label: (
        <a
          href="#"
          style={{ paddingLeft: '10px' }}
          data-test-id={TID.addTurn.typeOption(templatesToShow[i])}
          onClick={(e) => {
            e.preventDefault();
            setActiveTemplate(templatesToShow[i]);
            setError(null);
          }}
        >
          {templateSettings.label}
        </a>
      ),
    };
  });

  return (
    <Dropdown menu={{ items }} trigger="click" placement="bottomLeft">
      <Button
        className="w-full"
        data-test-id={TID.addTurn.typeBtn}
        style={{
          color: 'rgb(255, 255, 255)',
          backgroundColor: '#1b4d76',
          borderColor: '#667480',
          opacity: 0.65,
        }}
      >
        {settings[activeTemplate].label}
        <DownOutlined style={{ fontSize: '15px' }} />
      </Button>
    </Dropdown>
  );
};

export default DropdownTemplate;
