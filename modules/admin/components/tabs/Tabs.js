import { useMemo, useState } from 'react';
import { Tabs } from 'antd';
import GamesTab from './Games';
import ScriptsTab from './Scripts';

const tabs = [
  {
    key: 'games',
    label: 'Games',
    component: GamesTab,
  },
  {
    key: 'scripts',
    label: 'Scripts',
    component: ScriptsTab
  },
];

const AdminTabs = () => {
  const [activeTab, setActiveTab] = useState(tabs[0].key);
  const Component = useMemo(() => {
    return (
      tabs.find((tab) => tab.key === activeTab).component ||
      (() => `No component for ${activeTab}`)
    );
  }, [activeTab]);
  return (
    <>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabs} />
      <Component />
    </>
  );
};

export default AdminTabs;
