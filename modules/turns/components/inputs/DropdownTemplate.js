import { Button, Dropdown, Menu, Space } from 'antd';
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
          label: <a href="#">{templateSettings.label}</a>,
        };
      })}
    />
  );

  return (
    <Dropdown overlay={menu} placement="bottomLeft">
      <Button>{settings[activeTemplate].label}</Button>
    </Dropdown>
  );
};

export default DropdownTemplate;
