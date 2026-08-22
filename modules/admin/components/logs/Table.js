import { Alert, Button, Checkbox, Input, Space, Table } from 'antd';
import { getAdminLogsRequest } from '../../requests';
import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';

const columns = [
  {
    title: 'Log Type',
    dataIndex: 'logType',
    key: 'logType',
  },
  {
    title: 'Params',
    dataIndex: 'params',
    key: 'params',
    render: (t) => (t ? JSON.stringify(t) : ''),
  },
  {
    title: 'Info',
    dataIndex: 'info',
    key: 'info',
    render: (t) => (t ? JSON.stringify(t) : ''),
  },
  {
    title: 'Created At',
    dataIndex: 'createdAt',
    key: 'createdAt',
    sorter: (a, b) => dayjs(a.createdAt).diff(dayjs(b.createdAt)),
    render: (text) => dayjs(text).format('YYYY-MM-DD'),
    width: '15%',
  },
];

const AdminLogsTable = ({ onDetailsClick = () => {} }) => {
  const [logs, setLogs] = useState([]);
  // adminRequest поднимает отказ исключением — без обработчика это необработанный
  // reject и пустая таблица без объяснения
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortedInfo, setSortedInfo] = useState({});
  const handleChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
  };
  const filteredLogs = useMemo(() => {
    return logs;
  }, [logs, search]);
  const columnsWithActions = useMemo(() => {
    return [
      ...columns,
      {
        title: 'Actions',
        key: 'actions',
        render: (text, record) => (
          <Button htmlType="button" onClick={() => onDetailsClick(record)}>
            Details
          </Button>
        ),
        width: '15%',
      },
    ];
  }, []);

  useEffect(() => {
    getAdminLogsRequest()
      .then((data) => {
        setLogs(data.items || []);
      })
      .catch((err) => setError(err?.message || String(err)));
  }, []);
  return (
    <>
      {!!error && (
        <Alert className="mb-3" type="error" showIcon message={error} />
      )}
      <Table
        columns={columnsWithActions}
        dataSource={filteredLogs}
        rowKey="_id"
        onChange={handleChange}
        sorter={sortedInfo}
      />
    </>
  );
};
export default AdminLogsTable;
