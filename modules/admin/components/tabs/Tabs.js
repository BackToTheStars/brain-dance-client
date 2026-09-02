import { useMemo, useState } from 'react';
import { Tabs } from 'antd';
import GamesTab from './Games';
import ScriptsTab from './Scripts';
import LogsTab from './Logs';
import MediaRelocateTab from './MediaRelocate';
import StorageTab from './Storage';
import FilesTab from './Files';
import YoutubeTab from './Youtube';
import { TID } from '@/config/testIds';

// label — ReactNode: antd Tabs свои data-* до заголовка вкладки не доносит,
// поэтому data-test-id висит на <span> внутри подписи
const tabs = [
  {
    key: 'scripts',
    label: <span data-test-id={TID.adminTab('scripts')}>Scripts</span>,
    component: ScriptsTab,
  },
  {
    key: 'media-relocate',
    label: (
      <span data-test-id={TID.adminTab('media-relocate')}>Media relocate</span>
    ),
    component: MediaRelocateTab,
  },
  {
    key: 'storage',
    label: <span data-test-id={TID.adminTab('storage')}>Storage</span>,
    component: StorageTab,
  },
  {
    key: 'files',
    label: <span data-test-id={TID.adminTab('files')}>Files</span>,
    component: FilesTab,
  },
  {
    key: 'youtube',
    label: <span data-test-id={TID.adminTab('youtube')}>YouTube</span>,
    component: YoutubeTab,
  },
  {
    key: 'games',
    label: <span data-test-id={TID.adminTab('games')}>Games</span>,
    component: GamesTab,
  },
  {
    key: 'logs',
    label: <span data-test-id={TID.adminTab('logs')}>Logs</span>,
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
