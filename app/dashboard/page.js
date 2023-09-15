'use client';

import { ROLES } from '@/config/user';
import { loadGames } from '@/modules/game/games-redux/actions';
import { Button, Space, Table, Tag } from 'antd';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const renderPre = (field) => {
  return (text, record) => <pre>{JSON.stringify(record[field], null, 2)}</pre>;
};

const GamesPage = () => {
  const dispatch = useDispatch();
  const games = useSelector((s) => s.games.games);
  const [filter, setFilter] = useState('');

  const dataSource = filter
    ? games.filter(
        (game) => game.name.toLowerCase().indexOf(filter.toLowerCase()) !== -1
      )
    : games;
  const columns = [
    {
      title: 'Public',
      dataIndex: 'public',
      width: 50,
      render: (p) =>
        p ? <Tag color="green">public</Tag> : <Tag color="red">private</Tag>,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      width: 300,
    },
    {
      title: 'Turns',
      dataIndex: 'turnsCount',
      width: 100,
    },
    {
      title: 'Roles',
      dataIndex: 'codes',
      // render: renderPre('codes'),
      render: (codes) => {
        return (
          <Space wrap>
            {codes.map((c) => {
              const { viewportPointX, viewportPointY, _id, role, hash } = c;
              return (
                <Button key={hash} type="link" href={`/code?hash=${hash}&nickname=User`} target="_blank">
                  <span>
                    <b>{ROLES[role].name}</b> x:{viewportPointX} y:
                    {viewportPointY}
                  </span>
                </Button>
              );
            })}
          </Space>
        );
      },
      width: 300,
    },
    {
      title: 'Hash',
      dataIndex: 'hash',
      width: 100,
      render: (hash) => {
        return (
          <Button type="link" href={`/game?hash=${hash}`} target="_blank">
            {hash}
          </Button>
        );
      },
    },
    {
      title: 'Hash New',
      dataIndex: 'hash',
      // width: 100,
      render: (hash) => {
        return (
          <Button type="link" href={`/game-new?hash=${hash}`} target="_blank">
            {hash}
          </Button>
        );
      },
    },
  ];

  useEffect(() => {
    dispatch(loadGames());
  }, []);
  return (
    <div>
      <input
        onChange={(e) => setFilter(e.target.value)}
        value={filter}
        className="form-control game-search"
        type="text"
        placeholder="Search"
      />
      <Table
        pagination={{ position: ['bottomLeft', 'topLeft'] }}
        rowKey="_id"
        dataSource={dataSource}
        columns={columns}
      />
    </div>
  );
};

export default GamesPage;
