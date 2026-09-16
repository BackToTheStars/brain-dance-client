import { Alert, Button, Progress, Table } from 'antd';
import { useEffect, useState } from 'react';
import {
  getAdminMediaLimitsRequest,
  getAdminMediaStatsRequest,
} from '../../requests';
import { TID } from '@/config/testIds';

// Место на диске сервера и разбивка по типам медиа.
//
// Запрос уходит ТОЛЬКО по кнопке: byType считается агрегацией по всем документам
// `<type>.files` и линеен по числу файлов, поэтому ни на монтировании вкладки, ни по
// таймеру дёргать его нельзя (Tabs.js рендерит только активную вкладку — useEffect
// здесь сработал бы при каждом переключении). До первого клика — пустое состояние.
// Лимиты по файлам ничего не считают и грузятся сами при открытии вкладки.

const SOURCE_LABELS = {
  code: 'код',
  env: 'переменная окружения',
  cgroup: 'cgroup',
  os: 'ОС хоста',
  mongo: 'диск (статистика media)',
  unknown: 'неизвестно',
};

const formatSource = (entry) => {
  if (!entry) return '—';
  const label = SOURCE_LABELS[entry.source] || entry.source || '—';
  if (!entry.env) return label;
  return entry.ignoredEnv !== undefined
    ? `${label} (${entry.env}, проигнорировано «${entry.ignoredEnv}»)`
    : `${label} (${entry.env})`;
};

// Неизвестное — словом, не числом; нечисловое значение из окружения — как есть.
const formatLimitRow = (row) => {
  const entry = row?.entry;
  if (!entry) return '—';
  if (row.kind === 'storage') {
    return entry.free == null || entry.total == null
      ? 'неизвестно'
      : `свободно ${formatBytes(entry.free)} из ${formatBytes(entry.total)}`;
  }
  if (row.kind === 'telegram') {
    const size = entry.bytes == null ? 'неизвестно' : formatBytes(entry.bytes);
    return `${size} (${entry.mode === 'local' ? 'локальный сервер' : 'облако'})`;
  }
  if (row.kind === 'ms') {
    if (entry.ms != null) return `${entry.ms} мс`;
    return entry.value != null ? String(entry.value) : 'неизвестно';
  }
  if (entry.unlimited) return 'без ограничения';
  if (entry.bytes != null) return formatBytes(entry.bytes);
  return entry.value != null ? String(entry.value) : 'неизвестно';
};

// Порядок строк — как в цепочке потолков: nginx → загрузка → память → диск, затем бот.
const buildLimitRows = (limits) => {
  if (!limits) return [];
  const { media, bot } = limits;
  return [
    { key: 'nginx', label: 'nginx (client_max_body_size)', entry: media?.nginx, kind: 'bytes' },
    { key: 'requestBody', label: 'Тело запроса (JSON)', entry: media?.requestBody, kind: 'bytes' },
    { key: 'upload-images', label: 'Загрузка — images', entry: media?.upload?.images, kind: 'bytes' },
    { key: 'upload-videos', label: 'Загрузка — videos', entry: media?.upload?.videos, kind: 'bytes' },
    { key: 'upload-audios', label: 'Загрузка — audios', entry: media?.upload?.audios, kind: 'bytes' },
    { key: 'upload-pdfs', label: 'Загрузка — pdfs', entry: media?.upload?.pdfs, kind: 'bytes' },
    { key: 'memory-limit', label: 'Память контейнера media', entry: media?.memory?.limit, kind: 'bytes' },
    { key: 'memory-host', label: 'Память хоста', entry: media?.memory?.host, kind: 'bytes' },
    { key: 'storage', label: 'Место на диске', entry: media?.storage, kind: 'storage' },
    { key: 'bot-daily', label: 'Бот — суточный лимит загрузок', entry: bot?.dailyUpload, kind: 'bytes' },
    { key: 'bot-lock', label: 'Бот — пауза между файлами', entry: bot?.fileTimeLock, kind: 'ms' },
    { key: 'bot-pdf', label: 'Бот — PDF', entry: bot?.pdf, kind: 'bytes' },
    { key: 'bot-xcom', label: 'Бот — видео из x.com', entry: bot?.xcomVideo, kind: 'bytes' },
    { key: 'bot-import', label: 'Бот — файл импорта', entry: bot?.importFile, kind: 'bytes' },
    { key: 'bot-telegram', label: 'Бот — Telegram', entry: bot?.telegram, kind: 'telegram' },
  ];
};

const limitColumns = [
  { title: 'Звено', dataIndex: 'label', key: 'label' },
  { title: 'Значение', key: 'value', render: (text, row) => formatLimitRow(row) },
  { title: 'Откуда', key: 'source', render: (text, row) => formatSource(row.entry) },
];

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

  const [limits, setLimits] = useState(null);
  const [limitsLoading, setLimitsLoading] = useState(false);
  const [limitsError, setLimitsError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLimitsLoading(true);
    getAdminMediaLimitsRequest()
      .then((res) => {
        if (!cancelled) setLimits(res.item);
      })
      .catch((err) => {
        if (!cancelled) setLimitsError(err?.message || String(err));
      })
      .finally(() => {
        if (!cancelled) setLimitsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // сервер отдаёт 502, если media ответила ошибкой, и 503, если она недоступна;
      // adminRequest поднимает эти ответы исключением с message от сервера, поэтому
      // ручной проверки res.item здесь больше нет — до setStats доходит только 2xx
      const res = await getAdminMediaStatsRequest();
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

  const limitRows = buildLimitRows(limits);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <b>Лимиты</b>
        {!!limitsError && (
          <Alert
            type="error"
            showIcon
            title={limitsError}
            data-test-id={TID.adminStorage.limitsError}
          />
        )}
        {!!limitRows.length && (
          <Table
            columns={limitColumns}
            dataSource={limitRows}
            pagination={false}
            size="small"
            loading={limitsLoading}
            data-test-id={TID.adminStorage.limitsTable}
          />
        )}
        {!!limits?.media?.memory?.hint && (
          <div className="text-gray-500 text-xs">{limits.media.memory.hint}</div>
        )}
        {!!limits?.bot?.hint && (
          <div className="text-gray-500 text-xs">{limits.bot.hint}</div>
        )}
      </div>

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

      {!!error && (
        <Alert
          type="error"
          showIcon
          title={error}
          data-test-id={TID.adminStorage.error}
        />
      )}

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
          data-test-id={TID.adminStorage.table}
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
