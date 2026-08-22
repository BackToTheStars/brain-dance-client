import { Alert, Checkbox, Input, Space, Table } from 'antd';
import { getAdminTurnsRequest } from '../../requests';
import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import Link from 'next/link';

const HeaderCell = ({ record }) => {
    return (
      <div className="flex flex-col gap-2">
        <Link href={`/admin/turns/${record._id}`}>{record.header || 'No header'}</Link>
        {!!record.audioUrl && <div>audio: {record.audioUrl}</div>}
      </div>
    );
};

const columns = [
  {
    title: 'Header',
    dataIndex: 'header',
    key: 'header',
    width: '40%',
    render: (text, record) => <HeaderCell record={record} />,
    sorter: (a, b) => (a.header ? a.header.localeCompare(b.header) : 0),
  },
  {
    title: 'Type',
    dataIndex: 'contentType',
    key: 'contentType',
    width: '15%',
    sorter: (a, b) => a.contentType.localeCompare(b.contentType),
  },
  {
    title: 'Created',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (text) => dayjs(text).format('YYYY-MM-DD'),
    width: '15%',
    sorter: (a, b) => dayjs(a.createdAt).diff(dayjs(b.createdAt)),
  },
  {
    title: 'Updated',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    render: (text) => dayjs(text).format('YYYY-MM-DD'),
    width: '15%',
    sorter: (a, b) => dayjs(a.updatedAt).diff(dayjs(b.updatedAt)),
  },
];

const allContentTypes = ['picture', 'audio', 'video', 'comment', 'picture-only'];

const AdminTurnsTable = ({ gameId = null }) => {
  const [turns, setTurns] = useState([]);
  // adminRequest поднимает отказ исключением — без обработчика это необработанный
  // reject и пустая таблица без объяснения
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [contentTypes, setContentTypes] = useState(allContentTypes);
  const [sortedInfo, setSortedInfo] = useState({});
  const handleChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
  };

  const filteredTurns = useMemo(() => {
    if (!search && contentTypes.length === allContentTypes.length) return turns;
    return turns
      .filter((turn) => contentTypes.includes(turn.contentType))
      .filter(
        (turn) =>
          !search ||
          (turn.header &&
            turn.header.toLowerCase().includes(search.toLowerCase())),
      );
  }, [turns, search, contentTypes]);

  const columnsWithActions = useMemo(() => {
    return [
      ...columns,
      // {
      //   title: 'Actions',
      //   key: 'actions',
      //   render: (text, record) => (
      //     <Button htmlType="button" onClick={() => {}}>
      //       In Progress
      //     </Button>
      //   ),
      //   width: '15%',
      // },
    ];
  }, [columns]);

  useEffect(() => {
    getAdminTurnsRequest({ gameId })
      .then((data) => setTurns(data.items || []))
      .catch((err) => setError(err?.message || String(err)));
  }, [gameId]);

  return (
    <>
      {!!error && (
        <Alert className="mb-3" type="error" showIcon message={error} />
      )}
      <Space size="small" className="mb-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
          size="small"
        />
        <Checkbox.Group
          value={contentTypes}
          onChange={(value) => setContentTypes(value)}
        >
          {allContentTypes.map((contentType) => (
            <Checkbox value={contentType} key={contentType}>
              {contentType}
            </Checkbox>
          ))}
        </Checkbox.Group>
      </Space>
      <Table
        dataSource={filteredTurns}
        columns={columnsWithActions}
        rowKey="_id"
        pagination={{ pageSize: 5 }}
        onChange={handleChange}
        sortedInfo={sortedInfo}
      />
    </>
  );
};

export default AdminTurnsTable;
