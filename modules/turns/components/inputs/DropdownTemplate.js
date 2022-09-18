import { Button, Dropdown, Menu, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import React from 'react';

const DropdownTemplate = ({
  templatesToShow,
  settings,
  activeTemplate,
  setError,
  setActiveTemplate,
}) => {
  const menu = (
    <Menu
      onClick={({ key }) => {
        setActiveTemplate(templatesToShow[key]);
        setError(null);
      }}
      items={templatesToShow.map((el, i) => {
        const templateSettings = settings[el];
        return {
          key: i,
          label: (
            <a href="#" style={{ paddingLeft: '10px' }}>
              {templateSettings.label}
            </a>
          ),
        };
      })}
    />
  );

  return (
    <Dropdown overlay={menu} placement="bottomLeft">
      <Button
        className="w-100"
        style={{
          color: 'rgb(255, 255, 255)',
          backgroundColor: '#1b4d76',
          borderColor: '#667480',
          opacity: 0.65,
        }}
        // style={{ color: '#1b4d76' }}
      >
        {settings[activeTemplate].label}
        <DownOutlined style={{ fontSize: '15px' }} />
      </Button>
    </Dropdown>
  );
};

export default DropdownTemplate;
