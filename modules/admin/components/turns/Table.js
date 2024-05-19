import { Button, Checkbox, Input, Space, Table } from 'antd';
import { getAdminTurnsRequest } from '../../requests';
import { useEffect, useMemo, useState } from 'react';
import moment from 'moment';

const columns = [
  {
    title: 'Header',
    dataIndex: 'header',
    key: 'header',
    width: '40%',
    sorter: (a, b) => a.header ? a.header.localeCompare(b.header) : 0,
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
    render: (text) => moment(text).format('YYYY-MM-DD'),
    width: '15%',
    sorter: (a, b) => moment(a.createdAt).diff(moment(b.createdAt)),
  },
  {
    title: 'Updated',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    render: (text) => moment(text).format('YYYY-MM-DD'),
    width: '15%',
    sorter: (a, b) => moment(a.updatedAt).diff(moment(b.updatedAt)),
  },
];

const allContentTypes = [
  'zero-point',
  'picture',
  'video',
  'comment',
  'picture-only',
];

const AdminTurnsTable = ({ gameId = null }) => {
  const [turns, setTurns] = useState([]);
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
      {
        title: 'Actions',
        key: 'actions',
        render: (text, record) => (
          <Button htmlType="button" onClick={() => {}}>
            In Progress
          </Button>
        ),
        width: '15%',
      },
    ];
  }, [columns]);

  useEffect(() => {
    getAdminTurnsRequest({ gameId }).then((data) => setTurns(data.items));
  }, [gameId]);

  return (
    <>
      <Space size="small" className="mb-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
          size='small'
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
