// Файл доступов brain-access-export v2 (brain-platform/docs/lobby-api.md) из игр
// хранилища v0.0.1: один сайт, роль и пин в файл не пишутся.
export const ACCESS_EXPORT_TYPE = 'brain-access-export';
export const ACCESS_EXPORT_VERSION = 2;

export const gamesWithCodes = (games) =>
  (Array.isArray(games) ? games : [])
    .map((game) => ({
      hash: game?.hash,
      codes: (Array.isArray(game?.codes) ? game.codes : []).filter(
        (code) => code?.code,
      ),
    }))
    .filter((game) => game.codes.length > 0);

export const buildAccessExport = (
  games,
  { api, canvas, name },
  now = new Date(),
) => ({
  type: ACCESS_EXPORT_TYPE,
  version: ACCESS_EXPORT_VERSION,
  exportedAt: now.toISOString(),
  sites: [
    {
      api,
      canvas,
      name,
      games: gamesWithCodes(games).map(({ hash, codes }) => ({
        hash,
        codes: codes.map(({ code, nickname }) => ({
          code,
          ...(nickname ? { nickname } : {}),
        })),
      })),
    },
  ],
});

// Дата в имени — местная, как её видит человек; exportedAt — UTC.
export const accessExportFileName = (now = new Date()) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `brain-access-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.json`;
};
