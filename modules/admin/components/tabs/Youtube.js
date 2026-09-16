import { Alert, Table } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import Link from 'next/link';
import { getAdminYoutubeListRequest } from '../../requests';
import { getGameUrl } from '@/modules/lobby/utils/url';
import { TID } from '@/config/testIds';
import {
  IMAGE_TIMEOUT_MS,
  enqueueImage,
  isForeignImage,
} from '@/modules/lobby/utils/imageQueue';

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

const THUMBNAIL_BOX = { width: 60, height: 45 };

const NoThumbnail = ({ title }) => (
  <div
    className="flex items-center justify-center bg-gray-200 text-gray-500 text-xs shrink-0"
    style={THUMBNAIL_BOX}
    title={title}
  >
    нет превью
  </div>
);

// img.youtube.com недостижим — та же очередь и тот же таймаут, что у миниатюр
// ленты лобби (modules/lobby/utils/imageQueue.js): без них полсотни строк на
// странице держали слот разрешения имён браузера по 19-38 с каждая.
const VideoThumbnail = ({ youtubeId }) => {
  const src = `https://img.youtube.com/vi/${youtubeId}/default.jpg`;
  const releaseRef = useRef(null);
  const timerRef = useRef(null);
  const [shownSrc, setShownSrc] = useState(null);
  const [failed, setFailed] = useState(false);

  const release = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = null;
    if (releaseRef.current) {
      releaseRef.current();
      releaseRef.current = null;
    }
  }, []);

  useEffect(() => {
    setShownSrc(null);
    setFailed(false);
    if (!isForeignImage(src)) {
      setShownSrc(src);
      return undefined;
    }
    releaseRef.current = enqueueImage(() => {
      setShownSrc(src);
      timerRef.current = setTimeout(() => {
        setFailed(true);
        release();
      }, IMAGE_TIMEOUT_MS);
    });
    return release;
  }, [src, release]);

  if (failed) {
    return <NoThumbnail title="Превью не загрузилось" />;
  }
  if (!shownSrc) {
    return <div className="bg-gray-100 shrink-0" style={THUMBNAIL_BOX} />;
  }

  return (
    <img
      src={shownSrc}
      alt=""
      loading="lazy"
      width={THUMBNAIL_BOX.width}
      height={THUMBNAIL_BOX.height}
      onLoad={release}
      onError={() => {
        release();
        setFailed(true);
      }}
    />
  );
};

// youtubeId бывает null — ссылка на канал/плейлист опознаётся по хосту, но id
// ролика в ней нет. Собирать превью не из чего, показываем заглушку.
const VideoCell = ({ record }) => (
  <div className="flex items-center gap-2">
    {record.youtubeId ? (
      <VideoThumbnail youtubeId={record.youtubeId} />
    ) : (
      <NoThumbnail title="Ссылка без id ролика (канал или плейлист) — превью нет" />
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

// Через диалог входа (/game?hash=), а не прямо на холст: админ выбирает, кем войти.
// hash приходит null у хода без игры — открывать нечего.
const GameCell = ({ record }) =>
  record.hash ? (
    <a
      href={getGameUrl(record.hash, record.turnId)}
      target="_blank"
      rel="noreferrer"
      data-test-id={TID.adminYoutube.game}
      data-game-hash={record.hash}
    >
      в игре
    </a>
  ) : (
    <span>—</span>
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
        title: 'В игре',
        key: 'game',
        width: 90,
        render: (text, record) => <GameCell record={record} />,
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
          title={error}
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
