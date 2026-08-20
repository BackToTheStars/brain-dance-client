import { Alert, Button, Progress, Table } from 'antd';
import { useState } from 'react';
import { getAdminMediaStatsRequest } from '../../requests';

// Место на диске сервера и разбивка по типам медиа.
//
// Запрос уходит ТОЛЬКО по кнопке: byType считается агрегацией по всем документам
// `<type>.files` и линеен по числу файлов, поэтому ни на монтировании вкладки, ни по
// таймеру дёргать его нельзя (Tabs.js рендерит только активную вкладку — useEffect
// здесь сработал бы при каждом переключении). До первого клика — пустое состояние.

const UNITS = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ', 'ПБ'];

const formatBytes = (value) => {
  const bytes = Number(value);
  if (!Number.isFinite(bytes)) return '—';
  if (bytes < 1024) return `${bytes} ${UNITS[0]}`;

  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < UNITS.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toFixed(size >= 100 ? 0 : 1)} ${UNITS[unit]}`;
};

const formatCount = (value) => Number(value || 0).toLocaleString('ru-RU');

const columns = [
  { title: 'Тип', dataIndex: 'type', key: 'type' },
  {
    title: 'Файлов',
    dataIndex: 'count',
    key: 'count',
    align: 'right',
    render: (count) => formatCount(count),
  },
  {
    title: 'Объём',
    dataIndex: 'bytes',
    key: 'bytes',
    align: 'right',
    render: (bytes) => formatBytes(bytes),
  },
];

const StorageTab = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadedAt, setLoadedAt] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminMediaStatsRequest();
      if (!res || !res.item) {
        // сервер отдаёт 502, если media ответила ошибкой, и 503, если она недоступна —
        // в обоих случаях в теле осмысленный message, показываем его текстом
        throw new Error(res?.message || 'Не удалось получить статистику');
      }
      setStats(res.item);
      setLoadedAt(new Date());
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const fs = stats?.fs;
  const db = stats?.db;
  // состав byType задаётся конфигом media и может пополниться (пятый тип медиа),
  // поэтому строки таблицы — перебор ключей ответа, а не захардкоженный список
  const rows = Object.entries(stats?.byType || {}).map(([type, value]) => ({
    key: type,
    type,
    count: value?.count || 0,
    bytes: value?.bytes || 0,
  }));

  const usedPercent =
    fs && fs.total ? Math.round((fs.used / fs.total) * 1000) / 10 : 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 items-center">
        <Button type="primary" loading={loading} onClick={load}>
          Обновить
        </Button>
        {!!loadedAt && (
          <span className="text-gray-500">
            последний запрос: {loadedAt.toLocaleString('ru-RU')}
          </span>
        )}
      </div>

      {!!error && <Alert type="error" showIcon message={error} />}

      {!stats && !error && (
        <div className="text-gray-500">
          Данные не запрашивались. Подсчёт объёма по типам идёт по всем файлам,
          поэтому статистика собирается только по кнопке.
        </div>
      )}

      {!!fs && (
        <div>
          <div className="mb-1">
            Диск: занято {formatBytes(fs.used)} из {formatBytes(fs.total)},
            свободно {formatBytes(fs.free)}
          </div>
          <Progress
            percent={usedPercent}
            status={usedPercent >= 90 ? 'exception' : 'normal'}
          />
        </div>
      )}

      {!!rows.length && (
        <Table
          columns={columns}
          dataSource={rows}
          pagination={false}
          size="small"
          summary={(data) => {
            const totalCount = data.reduce((sum, row) => sum + row.count, 0);
            const totalBytes = data.reduce((sum, row) => sum + row.bytes, 0);
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}>
                  <b>Всего</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <b>{formatCount(totalCount)}</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} align="right">
                  <b>{formatBytes(totalBytes)}</b>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      )}

      {!!db && (
        <div className="text-gray-500">
          База media: данные {formatBytes(db.dataSize)}, на диске{' '}
          {formatBytes(db.storageSize)}, индексы {formatBytes(db.indexSize)}
        </div>
      )}
    </div>
  );
};

export default StorageTab;
