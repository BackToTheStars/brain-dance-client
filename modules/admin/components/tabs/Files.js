import {
  Alert,
  Button,
  DatePicker,
  Input,
  InputNumber,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { getAdminMediaFilesRequest } from '../../requests';
import { TID } from '@/config/testIds';

// Таблица файлов media поверх прокси `GET /admin/media/files`.
//
// Фильтрация, сортировка и пагинация — СЕРВЕРНЫЕ: сортировать и резать страницу
// на клиенте нельзя, здесь всегда лежит одна страница из четырёх коллекций,
// слитых media. Поэтому у antd отключены свои sorter-функции (`sorter: true`) и
// задан `total` из ответа.

// Зеркало `mediaTypes` из `media/config/media.js`. Список короткий и меняется
// раз в год (последним добавился `pdfs`), ручки «дай типы» у media нет —
// пополнится там, поправить и здесь.
const MEDIA_TYPES = ['images', 'videos', 'audios', 'pdfs'];

// Те же шесть полей, что принимает media (`SORT_FIELDS` в services/list.js).
const DEFAULT_SORT = 'uploadDate';
const DEFAULT_ORDER = 'descend';
const DEFAULT_LIMIT = 50;

const UNITS = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ', 'ПБ'];

const formatBytes = (value) => {
  if (value === null || value === undefined) return '—';
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

const formatDate = (value) =>
  value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '—';

// Имя в GridFS — uuid, человеку он ничего не говорит. Под ним показываем то,
// под каким именем файл пришёл: originalname у upload, title/originalUrl —
// у download-and-save и youtube-ветки.
const humanName = (record) =>
  record.originalname || record.title || record.originalUrl || null;

const emptyFilters = {
  type: [],
  name: '',
  minSize: null,
  maxSize: null,
  dates: null,
};

// Что уходит в запрос. Даты — ISO; `to` берётся концом дня, иначе фильтр «по
// 26 августа» отрезал бы всё, что загружено этим днём после полуночи.
const toQuery = (filters, sort, order, page, limit) => ({
  type: filters.type.join(','),
  name: filters.name.trim(),
  minSize: filters.minSize,
  maxSize: filters.maxSize,
  from: filters.dates?.[0] ? filters.dates[0].startOf('day').toISOString() : '',
  to: filters.dates?.[1] ? filters.dates[1].endOf('day').toISOString() : '',
  sort,
  order: order === 'ascend' ? 'asc' : 'desc',
  page,
  limit,
});

const FilesTab = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  // adminRequest поднимает отказ исключением с текстом сервера (в нём и текст
  // media — например разбор query), поэтому показываем его, а не alert.
  const [error, setError] = useState(null);

  // Черновик фильтров правится свободно, в запрос уходит только по «Показать»:
  // иначе каждая набранная буква била бы в media.
  const [draft, setDraft] = useState(emptyFilters);
  const [filters, setFilters] = useState(emptyFilters);

  const [sort, setSort] = useState(DEFAULT_SORT);
  const [order, setOrder] = useState(DEFAULT_ORDER);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const query = useMemo(
    () => toQuery(filters, sort, order, page, limit),
    [filters, sort, order, page, limit],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getAdminMediaFilesRequest(query)
      .then((data) => {
        if (cancelled) return;
        setItems(data.items || []);
        setTotal(data.total || 0);
      })
      .catch((err) => {
        if (cancelled) return;
        // страницу с ошибкой не оставляем наполовину: пусто и текст причины
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

  const applyFilters = () => {
    setPage(1);
    setFilters(draft);
  };

  const resetFilters = () => {
    setPage(1);
    setDraft(emptyFilters);
    setFilters(emptyFilters);
  };

  const columns = useMemo(
    () => [
      {
        title: 'Имя',
        dataIndex: 'filename',
        key: 'filename',
        sorter: true,
        sortDirections: ['ascend', 'descend'],
        sortOrder: sort === 'filename' ? order : null,
        render: (filename, record) => {
          const original = humanName(record);
          return (
            <div className="flex flex-col">
              <a href={record.src} target="_blank" rel="noreferrer">
                {filename}
              </a>
              {!!original && (
                <span className="text-gray-500 break-all">{original}</span>
              )}
            </div>
          );
        },
      },
      {
        title: 'Тип',
        dataIndex: 'type',
        key: 'type',
        width: 110,
        render: (type, record) =>
          record.contentType ? (
            <Tooltip title={record.contentType}>{type}</Tooltip>
          ) : (
            type
          ),
      },
      {
        title: 'Размер',
        dataIndex: 'size',
        key: 'size',
        align: 'right',
        width: 110,
        sorter: true,
        sortDirections: ['ascend', 'descend'],
        sortOrder: sort === 'size' ? order : null,
        render: (size) => formatBytes(size),
      },
      {
        title: 'Загружен',
        dataIndex: 'uploadDate',
        key: 'uploadDate',
        width: 150,
        sorter: true,
        sortDirections: ['ascend', 'descend'],
        sortOrder: sort === 'uploadDate' ? order : null,
        render: (value) => formatDate(value),
      },
      {
        // Дата самого файла в GridFS: у целой записи совпадает с «Загружен», а
        // расхождение (или прочерк) как раз и показывает, что запись и файл
        // живут разной жизнью.
        title: 'Файл в GridFS',
        dataIndex: 'storedAt',
        key: 'storedAt',
        width: 150,
        sorter: true,
        sortDirections: ['ascend', 'descend'],
        sortOrder: sort === 'storedAt' ? order : null,
        render: (value) => formatDate(value),
      },
      {
        title: 'Обращений',
        dataIndex: 'accessCount',
        key: 'accessCount',
        align: 'right',
        width: 110,
        sorter: true,
        sortDirections: ['ascend', 'descend'],
        sortOrder: sort === 'accessCount' ? order : null,
      },
      {
        title: 'Последнее',
        dataIndex: 'lastAccessAt',
        key: 'lastAccessAt',
        width: 150,
        sorter: true,
        sortDirections: ['ascend', 'descend'],
        sortOrder: sort === 'lastAccessAt' ? order : null,
        render: (value) => (value ? formatDate(value) : 'не обращались'),
      },
      {
        title: 'Признаки',
        key: 'flags',
        width: 130,
        render: (text, record) => (
          <>
            {record.missing && (
              <Tag color="red" title="запись есть, файла нет">
                нет файла
              </Tag>
            )}
            {record.duplicate && (
              <Tag color="orange" title={`одноимённых файлов: ${record.fileCount}`}>
                дубли: {record.fileCount}
              </Tag>
            )}
          </>
        ),
      },
    ],
    [sort, order],
  );

  // Сортировка и страница приходят одним колбэком antd. Снятой сортировки быть
  // не может (`sortDirections` без 'none'): media всегда сортирует по какому-то
  // полю, и нейтрального состояния у неё нет.
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
      <Space size="small" wrap>
        <Select
          mode="multiple"
          allowClear
          placeholder="Тип"
          className="min-w-[200px]"
          value={draft.type}
          onChange={(value) => setDraft({ ...draft, type: value })}
          options={MEDIA_TYPES.map((type) => ({ value: type, label: type }))}
          data-test-id={TID.adminFiles.filter('type')}
        />
        <Input
          placeholder="Имя, исходное имя или ссылка"
          className="w-[280px]"
          allowClear
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          onPressEnter={applyFilters}
          data-test-id={TID.adminFiles.filter('name')}
        />
        {/* ширина стилем, а не классом: у InputNumber внутренняя обёртка
            перебивает утилиту, и подпись обрезается до «Размер …» */}
        <InputNumber
          placeholder="Размер от, байт"
          style={{ width: 170 }}
          min={0}
          value={draft.minSize}
          onChange={(value) => setDraft({ ...draft, minSize: value })}
          data-test-id={TID.adminFiles.filter('min-size')}
        />
        <InputNumber
          placeholder="до, байт"
          style={{ width: 120 }}
          min={0}
          value={draft.maxSize}
          onChange={(value) => setDraft({ ...draft, maxSize: value })}
          data-test-id={TID.adminFiles.filter('max-size')}
        />
        {/* test-id на обёртке: rc-picker вешает data-* сразу на оба поля
            диапазона, и по нему нельзя было бы адресоваться однозначно */}
        <span data-test-id={TID.adminFiles.filter('dates')}>
          <DatePicker.RangePicker
            allowEmpty={[true, true]}
            value={draft.dates}
            onChange={(value) => setDraft({ ...draft, dates: value })}
          />
        </span>
        <Button
          type="primary"
          loading={loading}
          onClick={applyFilters}
          data-test-id={TID.adminFiles.reload}
        >
          Показать
        </Button>
        <Button onClick={resetFilters} data-test-id={TID.adminFiles.reset}>
          Сбросить
        </Button>
      </Space>

      {!!error && (
        <Alert
          type="error"
          showIcon
          message={error}
          data-test-id={TID.adminFiles.error}
        />
      )}

      {/* test-id на обёртке, а не на <Table>: antd раскладывает свои пропсы
          по частям таблицы и произвольный data-* до DOM может не донести */}
      <div data-test-id={TID.adminFiles.table}>
        <Table
          columns={columns}
          dataSource={items}
          rowKey="_id"
          size="small"
          loading={loading}
          onChange={handleTableChange}
          onRow={(record) => ({
            'data-test-id': TID.adminFiles.row,
            'data-file-id': record._id,
          })}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            // потолок страницы у media — 200, больше она не отдаст
            pageSizeOptions: [20, 50, 100, 200],
            showSizeChanger: true,
            showTotal: (count) => `всего: ${count}`,
          }}
        />
      </div>
    </div>
  );
};

export default FilesTab;
