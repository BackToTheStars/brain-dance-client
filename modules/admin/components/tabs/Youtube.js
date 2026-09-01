import { Alert, Table } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import Link from 'next/link';
import { getAdminYoutubeListRequest } from '../../requests';
import { TID } from '@/config/testIds';

// Опись ходов, чьи videoUrl распознаны как YouTube — «что ещё держится на
// чужом хостинге», чтобы админ открыл ход и перезалил видео руками. Никакого
// вызова замороженного переноса (см. YoutubeBlock в turns/Detail.js) отсюда нет,
// страница только читает `GET /admin/turns/youtube-list`.
//
// Сортировка и пагинация — СЕРВЕРНЫЕ, по образцу вкладки Files: сервер сам
// решает, что такое YouTube-ссылка (classifyUrl), клиент режет и сортирует
// только то, что прислали.

const DEFAULT_SORT = 'updatedAt';
const DEFAULT_ORDER = 'descend';
const DEFAULT_LIMIT = 50;

const formatDate = (value) =>
  value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '—';

const toQuery = (sort, order, page, limit) => ({
  sort,
  order: order === 'ascend' ? 'asc' : 'desc',
  page,
  limit,
});

// youtubeId бывает null — ссылка на канал/плейлист опознаётся по хосту, но id
// ролика в ней нет. Собирать превью не из чего, показываем заглушку.
const VideoCell = ({ record }) => (
  <div className="flex items-center gap-2">
    {record.youtubeId ? (
      <img
        src={`https://img.youtube.com/vi/${record.youtubeId}/default.jpg`}
        alt=""
        loading="lazy"
        width={60}
        height={45}
      />
    ) : (
      <div
        className="flex items-center justify-center bg-gray-200 text-gray-500 text-xs shrink-0"
        style={{ width: 60, height: 45 }}
        title="Ссылка без id ролика (канал или плейлист) — превью нет"
      >
        нет превью
      </div>
    )}
    <a href={record.videoUrl} target="_blank" rel="noreferrer" className="break-all">
      {record.videoUrl}
    </a>
  </div>
);

// Ссылка ведёт на существующую страницу хода в админке (Detail.js), где видно
// все медиа-поля и текущий videoUrl — саму перезаливку админ делает в игре.
const HeaderCell = ({ record }) => (
  <Link href={`/admin/turns/${record.turnId}`}>
    {record.header || '(без названия)'}
  </Link>
);

const YoutubeTab = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [sort, setSort] = useState(DEFAULT_SORT);
  const [order, setOrder] = useState(DEFAULT_ORDER);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const query = useMemo(
    () => toQuery(sort, order, page, limit),
    [sort, order, page, limit],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getAdminYoutubeListRequest(query)
      .then((data) => {
        if (cancelled) return;
        setItems(data.items || []);
        setTotal(data.total || 0);
      })
      .catch((err) => {
        if (cancelled) return;
        setItems([]);
        setTotal(0);
        setError(err?.message || String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  const columns = useMemo(
    () => [
      {
        title: 'Видео',
        key: 'video',
        width: 320,
        render: (text, record) => <VideoCell record={record} />,
      },
      {
        title: 'Ход',
        dataIndex: 'header',
        key: 'turn',
        render: (text, record) => <HeaderCell record={record} />,
      },
      {
        title: 'Создан',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 160,
        sorter: true,
        sortDirections: ['ascend', 'descend'],
        sortOrder: sort === 'createdAt' ? order : null,
        render: formatDate,
      },
      {
        title: 'Изменён',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        width: 160,
        sorter: true,
        sortDirections: ['ascend', 'descend'],
        sortOrder: sort === 'updatedAt' ? order : null,
        render: formatDate,
      },
    ],
    [sort, order],
  );

  // Сортировка только по датам (сервер понимает createdAt/updatedAt), поэтому
  // sorter стоит только на этих двух колонках; остальные antd не пробует сортировать.
  const handleTableChange = (pagination, tableFilters, sorter) => {
    if (sorter?.columnKey && sorter?.order) {
      setSort(sorter.columnKey);
      setOrder(sorter.order);
    }
    setPage(pagination.current || 1);
    setLimit(pagination.pageSize || DEFAULT_LIMIT);
  };

  return (
    <div className="flex flex-col gap-3">
      {!!error && (
        <Alert
          type="error"
          showIcon
          message={error}
          data-test-id={TID.adminYoutube.error}
        />
      )}

      <div data-test-id={TID.adminYoutube.table}>
        <Table
          columns={columns}
          dataSource={items}
          rowKey="turnId"
          size="small"
          loading={loading}
          onChange={handleTableChange}
          onRow={(record) => ({
            'data-test-id': TID.adminYoutube.row,
            'data-turn-id': record.turnId,
          })}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            pageSizeOptions: [20, 50, 100, 200, 500],
            showSizeChanger: true,
            showTotal: (count) => `всего: ${count}`,
          }}
        />
      </div>
    </div>
  );
};

export default YoutubeTab;
