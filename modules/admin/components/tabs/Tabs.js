import { useMemo, useState } from 'react';
import { Tabs } from 'antd';
import GamesTab from './Games';
import ScriptsTab from './Scripts';
import LogsTab from './Logs';
import MediaRelocateTab from './MediaRelocate';
import StorageTab from './Storage';
import FilesTab from './Files';

const tabs = [
  {
    key: 'scripts',
    label: 'Scripts',
    component: ScriptsTab,
  },
  {
    key: 'media-relocate',
    label: 'Media relocate',
    component: MediaRelocateTab,
  },
  {
    key: 'storage',
    label: 'Storage',
    component: StorageTab,
  },
  {
    key: 'files',
    label: 'Files',
    component: FilesTab,
  },
  {
    key: 'games',
    label: 'Games',
    component: GamesTab,
  },
  {
    key: 'logs',
    label: 'Logs',
    component: LogsTab,
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
