import { useState } from 'react';
import AdminLogsTable from '../logs/Table';
import AdminLogDetails from '../logs/Details';

const LogsTab = () => {
  const [activeLog, setActiveLog] = useState(null);
  return (
    <div className="flex gap-2">
      <div className="w-2/3">
        <AdminLogsTable onDetailsClick={setActiveLog} />
      </div>
      <div className="w-1/3">
        {!!activeLog && <AdminLogDetails log={activeLog} />}
      </div>
    </div>
  );
};

export default LogsTab;