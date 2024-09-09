import { Button, Checkbox, Input, Space, Table } from 'antd';
import { getAdminLogsRequest } from '../../requests';
import { useEffect, useMemo, useState } from 'react';
import moment from 'moment';

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
    sorter: (a, b) => moment(a.createdAt).diff(moment(b.createdAt)),
    render: (text) => moment(text).format('YYYY-MM-DD'),
    width: '15%',
  },
];

const AdminLogsTable = ({ onDetailsClick = () => {} }) => {
  const [logs, setLogs] = useState([]);
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
    getAdminLogsRequest().then((data) => {
      setLogs(data.items);
    });
  }, []);
  return (
    <Table
      columns={columnsWithActions}
      dataSource={filteredLogs}
      rowKey="_id"
      onChange={handleChange}
      sorter={sortedInfo}
    />
  );
};
export default AdminLogsTable;
