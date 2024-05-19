import { Button, Checkbox, Input, Space, Table } from 'antd';
import { getAdminGamesRequest } from '../../requests';
import { useEffect, useMemo, useState } from 'react';
import moment from 'moment';

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name),
    width: '40%',
  },
  {
    title: 'Privacy',
    dataIndex: 'public',
    key: 'public',
    sorter: (a, b) => a.public - b.public,
    render: (text) => (text ? 'public' : 'private'),
    width: '15%',
  },
  {
    title: 'T Count',
    dataIndex: 'turnsCount',
    key: 'turnsCount',
    sorter: (a, b) => a.turnsCount - b.turnsCount,
    width: '15%',
  },
  {
    title: 'Published',
    dataIndex: 'createdAt',
    key: 'createdAt',
    sorter: (a, b) => moment(a.createdAt).diff(moment(b.createdAt)),
    render: (text) => moment(text).format('YYYY-MM-DD'),
    width: '15%',
  },
];

const AdminGamesTable = ({ onDetailsClick = () => {} }) => {
  const [games, setGames] = useState([]);
  const [search, setSearch] = useState('');
  const [showPublic, setShowPublic] = useState(true);
  const [showPrivate, setShowPrivate] = useState(true);
  const [sortedInfo, setSortedInfo] = useState({});
  const handleChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
  };

  const filteredGames = useMemo(() => {
    if (!search && showPublic && showPrivate) return games;
    return games
      .filter((game) => (!showPublic ? !game.public : game))
      .filter((game) => (!showPrivate ? game.public : game))
      .filter((game) => game.name.toLowerCase().includes(search.toLowerCase()));
  }, [games, search, showPublic, showPrivate]);

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
  }, [columns, onDetailsClick]);

  useEffect(() => {
    getAdminGamesRequest().then((data) => setGames(data.items));
  }, []);

  return (
    <>
      <Space size="small" className="mb-3">
        <Input
          placeholder="Search"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full"
        />
        <Checkbox
          checked={showPublic}
          onChange={(e) => setShowPublic(e.target.checked)}
          className="mr-2"
        >
          Public
        </Checkbox>
        <Checkbox
          checked={showPrivate}
          onChange={(e) => setShowPrivate(e.target.checked)}
        >
          Private
        </Checkbox>
      </Space>
      <Table
        columns={columnsWithActions}
        dataSource={filteredGames}
        rowKey="_id"
        onChange={handleChange}
        sorter={sortedInfo}
      />
    </>
  );
};

export default AdminGamesTable;
