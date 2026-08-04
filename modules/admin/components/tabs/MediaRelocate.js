import { Button, Input, Tag } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { getAdminGamesRequest, runAdminScriptRequest } from '../../requests';
import Loading from '@/modules/ui/components/common/Loading';

// Хардкод процедуры переноса медиа — единственной, ради которой существует вкладка
// (см. server/modules/admin/services/scripts.js, SCRIPT_MEDIA).
const SCRIPT_NAME = 'SCRIPT_MEDIA';
const COMMAND_CHECK = 'checkRelocate';
const COMMAND_RUN = 'relocate';

const COMMAND_LABELS = {
  [COMMAND_CHECK]: 'проверка',
  [COMMAND_RUN]: 'перенос',
};

const MediaRelocateTab = () => {
  const [games, setGames] = useState(null);
  const [searchText, setSearchText] = useState('');
  // отчёты по gameId: { command, success, text }
  const [reports, setReports] = useState({});
  const [pendingId, setPendingId] = useState(null);
  // прогресс массового прогона: { command, total, done } | null
  const [bulk, setBulk] = useState(null);
  const cancelRef = useRef(false);

  useEffect(() => {
    getAdminGamesRequest({ limit: 1000, sort: 'name', sortDir: 'asc' })
      .then((res) => {
        setGames(res.items || []);
      })
      .catch((err) => {
        console.log(err);
        setGames([]);
      });
  }, []);

  const runOne = async (game, commandName) => {
    setPendingId(game._id);
    try {
      const res = await runAdminScriptRequest(SCRIPT_NAME, commandName, {
        gameId: game._id,
      });
      setReports((prev) => ({
        ...prev,
        [game._id]: {
          command: commandName,
          success: !!res.success,
          text: res.result || res.message || '',
        },
      }));
    } catch (err) {
      setReports((prev) => ({
        ...prev,
        [game._id]: {
          command: commandName,
          success: false,
          text: String(err),
        },
      }));
    } finally {
      setPendingId(null);
    }
  };

  // Игры обрабатываются строго последовательно: media качает файлы в память,
  // параллельный прогон по ~70 играм положит его.
  const runBulk = async (commandName) => {
    if (
      commandName === COMMAND_RUN &&
      !confirm(`Перенести файлы всех игр (${games.length}) на текущий медиа-сервер?`)
    ) {
      return;
    }
    cancelRef.current = false;
    setBulk({ command: commandName, total: games.length, done: 0 });
    for (const game of games) {
      if (cancelRef.current) break;
      await runOne(game, commandName);
      setBulk((prev) => (prev ? { ...prev, done: prev.done + 1 } : prev));
    }
    setBulk(null);
  };

  const busy = !!bulk || !!pendingId;

  if (games === null) {
    return <Loading />;
  }

  const filteredGames = searchText
    ? games.filter((game) =>
        (game.name || '').toLowerCase().includes(searchText.toLowerCase()),
      )
    : games;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 items-center">
        <Input
          className="w-64"
          placeholder="Фильтр по названию"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
        <Button disabled={busy} onClick={() => runBulk(COMMAND_CHECK)}>
          Проверить все
        </Button>
        <Button disabled={busy} onClick={() => runBulk(COMMAND_RUN)}>
          Перенести все
        </Button>
        {!!bulk && (
          <>
            <span>
              {COMMAND_LABELS[bulk.command]}: {bulk.done} / {bulk.total}
            </span>
            <Button danger onClick={() => (cancelRef.current = true)}>
              Стоп
            </Button>
          </>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {filteredGames.map((game) => {
          const report = reports[game._id];
          const isPending = pendingId === game._id;
          return (
            <div key={game._id} className="border border-solid border-gray-300 rounded-md p-2">
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <span className="font-bold">{game.name || '(без названия)'}</span>{' '}
                  <span className="text-gray-500">{game._id}</span>
                </div>
                {isPending && <Loading />}
                <Button
                  size="small"
                  disabled={busy}
                  onClick={() => runOne(game, COMMAND_CHECK)}
                >
                  Проверить
                </Button>
                <Button
                  size="small"
                  disabled={busy}
                  onClick={() => runOne(game, COMMAND_RUN)}
                >
                  Перенести
                </Button>
              </div>
              {!!report && (
                <div className="mt-2">
                  <Tag color={report.success ? 'green' : 'red'}>
                    {COMMAND_LABELS[report.command]}:{' '}
                    {report.success ? 'ок' : 'ошибка'}
                  </Tag>
                  <pre className="whitespace-pre-wrap text-xs mt-1 mb-0">
                    {report.text}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MediaRelocateTab;
