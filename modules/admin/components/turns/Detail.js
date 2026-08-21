import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Alert, Button, Collapse, Radio, Tag } from 'antd';
import {
  getAdminTurnRequest,
  probeTurnYoutubeRequest,
  relocateTurnMediaRequest,
  relocateTurnYoutubeRequest,
} from '../../requests';
import { STATIC_MEDIA_URL } from '@/config/server';

// Порядок и состав — как TURN_FIELDS на сервере
// (server/modules/game/services/mediaRelocate.js): перенос идёт по всем пяти полям
// одним вызовом, поэтому кнопка одна на ход, а не на поле.
const MEDIA_FIELDS = [
  ['imageUrl', 'Картинка'],
  ['videoUrl', 'Видео'],
  ['videoPreview', 'Превью видео'],
  ['audioUrl', 'Аудио'],
  ['pdfUrl', 'PDF'],
];

const FIELD_LABELS = Object.fromEntries(MEDIA_FIELDS);

// Статусы из слоя relocate. `deferred` — ссылку не забрать прямым запросом
// (YouTube и подобные), для неё есть отдельная ветка ниже.
const STATUS_VIEW = {
  moved: { color: 'green', text: 'перенесено' },
  local: { color: 'blue', text: 'уже своя' },
  deferred: { color: 'orange', text: 'нужен отдельный перенос' },
  unknown: { color: 'default', text: 'не опознано' },
  error: { color: 'red', text: 'ошибка' },
};

// Своя ссылка = совпадение хоста с хостом STATIC_MEDIA_URL, а не префикс строки:
// startsWith принимал бы localhost:30111 за localhost:3011, красил чужую ссылку
// «своей» — и, если так совпали все поля, прятал кнопку переноса целиком.
// Правил классификации это не дублирует (решение 9 в youtube-relocate.md):
// хост — только для отображения и показа кнопки, статусы считает сервер.
const getUrlHost = (url) => {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
};
const MEDIA_HOST = getUrlHost(STATIC_MEDIA_URL);
const isLocalUrl = (url) =>
  !!url && !!MEDIA_HOST && getUrlHost(url) === MEDIA_HOST;

// Сервер классифицирует все пять полей, и пустое приходит как 'local'. Строка
// «Видео — уже своя» у хода без видео только мешает читать результат, поэтому
// такие прячем — но лишь когда поле и правда пустое и ничего не сломалось.
const isEmptyFieldResult = (result) =>
  !result.from && result.status === 'local' && !result.error;

const formatBytes = (bytes) => {
  if (typeof bytes !== 'number') return 'размер неизвестен';
  const units = ['Б', 'КБ', 'МБ', 'ГБ'];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toFixed(size >= 100 || unit === 0 ? 0 : 1)} ${units[unit]}`;
};

const formatDuration = (seconds) => {
  if (typeof seconds !== 'number') return null;
  const total = Math.round(seconds);
  const hh = Math.floor(total / 3600);
  const mm = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const ss = String(total % 60).padStart(2, '0');
  return hh ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;
};

// Строка результата по одному полю: что было, что стало и почему.
const ResultRow = ({ result }) => {
  const view = STATUS_VIEW[result.status] || {
    color: 'default',
    text: result.status,
  };
  return (
    <div className="flex flex-col gap-1 border-b border-gray-200 py-1 last:border-b-0">
      <div className="flex gap-2 items-center">
        <b>{FIELD_LABELS[result.field] || result.field}</b>
        <Tag color={view.color}>{view.text}</Tag>
        {!!result.provider && <Tag>{result.provider}</Tag>}
      </div>
      {!!result.url && (
        <div className="text-xs break-all">новая ссылка: {result.url}</div>
      )}
      {!!result.error && (
        <div className="text-xs break-all text-red-500">{result.error}</div>
      )}
      {!result.url && !result.error && !!result.from && (
        <div className="text-xs break-all text-gray-500">{result.from}</div>
      )}
    </div>
  );
};

// Выбор варианта ролика и его перенос. Список приходит от media как есть:
// formatId («137+140») уходит обратно строкой, разбирать его тут нечего.
const YoutubeBlock = ({ turn, busy, setBusy, onRelocated, onError }) => {
  const [probe, setProbe] = useState(null);
  const [formatId, setFormatId] = useState(null);
  const [phase, setPhase] = useState(null); // 'probe' | 'download'

  const runProbe = async () => {
    setBusy(true);
    setPhase('probe');
    onError(null);
    try {
      const data = await probeTurnYoutubeRequest(turn._id);
      setProbe(data.item);
      const first = (data.item.formats || []).find((f) => !f.tooLarge);
      setFormatId(first ? first.formatId : null);
    } catch (err) {
      onError(err?.message || String(err));
    } finally {
      setPhase(null);
      setBusy(false);
    }
  };

  const runRelocate = async () => {
    setBusy(true);
    setPhase('download');
    onError(null);
    try {
      const data = await relocateTurnYoutubeRequest(turn._id, formatId);
      onRelocated(data.item);
      setProbe(null);
    } catch (err) {
      onError(err?.message || String(err));
    } finally {
      setPhase(null);
      setBusy(false);
    }
  };

  const formats = probe?.formats || [];

  return (
    <div className="flex flex-col gap-2 border border-solid border-gray-300 rounded-md p-2">
      <div className="flex gap-2 items-center">
        <b>YouTube</b>
        <Button
          size="small"
          disabled={busy}
          loading={phase === 'probe'}
          onClick={runProbe}
        >
          Проверить варианты
        </Button>
      </div>

      {!!probe && (
        <>
          <div>
            {probe.title}
            {!!formatDuration(probe.duration) && (
              <span className="text-gray-500">
                {' '}
                ({formatDuration(probe.duration)})
              </span>
            )}
          </div>

          {!formats.length && (
            <div className="text-gray-500">Вариантов не нашлось.</div>
          )}

          {!!formats.length && (
            <Radio.Group
              value={formatId}
              onChange={(e) => setFormatId(e.target.value)}
              disabled={busy}
            >
              <div className="flex flex-col gap-1">
                {formats.map((format) => (
                  <Radio
                    key={format.formatId}
                    value={format.formatId}
                    disabled={format.tooLarge}
                  >
                    {format.resolution || format.formatId}
                    {!!format.fps && ` · ${format.fps} fps`}
                    {!!format.ext && ` · ${format.ext}`}
                    {' · '}
                    {format.approx ? '≈ ' : ''}
                    {formatBytes(format.filesize)}
                    {format.tooLarge && (
                      <Tag color="red" className="ml-2">
                        больше лимита
                      </Tag>
                    )}
                  </Radio>
                ))}
              </div>
            </Radio.Group>
          )}

          {!!formats.length && (
            <div className="flex flex-col gap-1">
              <Button
                type="primary"
                className="self-start"
                disabled={busy || !formatId}
                loading={phase === 'download'}
                onClick={runRelocate}
              >
                Перенести выбранный вариант
              </Button>
              {/* Операция синхронная и долгая (BP-4, решение 5): прогресса нет,
                  поэтому честно предупреждаем и не даём запустить второй перенос. */}
              <div className="text-xs text-gray-500">
                {phase === 'download'
                  ? 'Идёт перенос: видео скачивается, склеивается и уходит на статику. Это занимает минуты (22 МБ — около 4–5 минут). Не закрывайте страницу.'
                  : 'Перенос идёт минутами и без индикатора прогресса: 22 МБ — около 4–5 минут.'}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Всё медиа хода: что за ссылки стоят сейчас, своя статика или чужая, и что
// вышло из последнего переноса. До правки здесь было только аудио, а результат
// не показывался вовсе — deferred/unknown/error пропадали молча.
const MediaBlock = ({ turn, setTurn }) => {
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [relocating, setRelocating] = useState(false);

  const present = MEDIA_FIELDS.filter(([field]) => !!turn[field]).map(
    ([field, label]) => ({ field, label, url: turn[field] }),
  );
  const foreign = present.filter((row) => !isLocalUrl(row.url));

  const shownResults = (results || []).filter((r) => !isEmptyFieldResult(r));

  // Сигнал для youtube-ветки — из ответа сервера, а не из разбора ссылки на клиенте.
  const youtubeDeferred = (results || []).some(
    (row) =>
      row.field === 'videoUrl' &&
      row.status === 'deferred' &&
      row.provider === 'youtube',
  );

  const applyRelocated = (item) => {
    setResults(item.results || []);
    if (item.turn) {
      setTurn(item.turn);
    }
  };

  const runRelocate = async () => {
    setBusy(true);
    setRelocating(true);
    setError(null);
    try {
      const data = await relocateTurnMediaRequest(turn._id);
      applyRelocated(data.item);
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setRelocating(false);
      setBusy(false);
    }
  };

  if (!present.length) {
    return <div className="text-gray-500">У хода нет медиа-ссылок.</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        {present.map((row) => (
          <div key={row.field} className="flex gap-2 items-baseline">
            <b className="shrink-0">{row.label}</b>
            {isLocalUrl(row.url) ? (
              <Tag color="blue">своя статика</Tag>
            ) : (
              <Tag color="orange">чужая ссылка</Tag>
            )}
            <span className="text-xs break-all">{row.url}</span>
          </div>
        ))}
      </div>

      {!!foreign.length && (
        <Button
          className="self-start"
          disabled={busy}
          loading={relocating}
          onClick={runRelocate}
        >
          Перенести медиа на свою статику
        </Button>
      )}

      {!foreign.length && (
        <div className="text-gray-500">
          Все ссылки хода уже ведут на свою статику — переносить нечего.
        </div>
      )}

      {!!error && <Alert type="error" showIcon message={error} />}

      {!!results && (
        <div className="border border-solid border-gray-300 rounded-md p-2">
          <div className="mb-1">Результат переноса:</div>
          {!shownResults.length && (
            <div className="text-gray-500">Переносить было нечего.</div>
          )}
          {shownResults.map((result) => (
            <ResultRow key={result.field} result={result} />
          ))}
        </div>
      )}

      {youtubeDeferred && (
        <YoutubeBlock
          turn={turn}
          busy={busy}
          setBusy={setBusy}
          onRelocated={applyRelocated}
          onError={setError}
        />
      )}
    </div>
  );
};

const TurnDetail = () => {
  const [turn, setTurn] = useState();
  const [loadError, setLoadError] = useState(null);
  const { turn_id } = useParams();
  const reloadTurn = () =>
    getAdminTurnRequest(turn_id)
      .then((data) => setTurn(data.item))
      .catch((err) => setLoadError(err?.message || String(err)));
  useEffect(() => {
    if (!turn_id) return;
    reloadTurn();
  }, [turn_id]);

  if (loadError) {
    return (
      <div className="mt-2">
        <Alert type="error" showIcon message={loadError} />
      </div>
    );
  }
  if (!turn) return null;
  return (
    <div className="mt-2 flex flex-col gap-2">
      <h3>Turn #{turn._id}</h3>
      <MediaBlock turn={turn} setTurn={setTurn} />
      <Collapse
        defaultActiveKey={[]}
        items={[
          {
            key: '1',
            label: 'Full Turn Data',
            children: <pre>{JSON.stringify(turn, null, 2)}</pre>,
          },
        ]}
      />
    </div>
  );
};

export default TurnDetail;
