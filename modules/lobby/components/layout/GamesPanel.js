import { loadGames } from '@/modules/lobby/redux/actions';

import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import GameRow from '../ui/GameRow';
import Loading from '@/modules/ui/components/common/Loading';
import { useTranslations } from 'next-intl';

const GamesPanel = () => {
  const t = useTranslations('Lobby');
  const dispatch = useDispatch();
  const settingsGames = useSelector((s) => s.settings.games);
  const games = useSelector((s) => s.lobby.games);

  const dSettingsHashes = useMemo(() => {
    if (!settingsGames) return {};
    return settingsGames.reduce((acc, obj) => {
      return {
        ...acc,
        [obj.hash]: {
          isPinned: obj?.codes ? !!obj.codes.find((c) => c.active) : false,
          codes: obj?.codes || [],
          // obj,
        },
      };
    }, {});
  }, [settingsGames]);

  useEffect(() => {
    dispatch(loadGames());
  }, [settingsGames]);

  const sortedGames = useMemo(() => {
    const sorted = [...games];
    sorted.sort((a, b) => {
      if (dSettingsHashes[a.hash]?.isPinned) {
        if (!dSettingsHashes[b.hash]?.isPinned) return -1;
      } else if (dSettingsHashes[b.hash]?.isPinned) {
        return 1;
      }
      return 0;
    });
    return sorted;
  }, [dSettingsHashes, games]);

  return (
    <aside className="lobby-panel lobby-panel_with-bg p-2 h-full overflow-y-auto">
      <div className="flex lobby-panel__divider-b">
        <div className="flex-1">{t('Games')}</div>
      </div>
      <div className="select-none">
        {sortedGames.length === 0 && <Loading />}
        {sortedGames.map((game, index) => {
          return (
            <GameRow
              key={game._id}
              game={game}
              index={index}
              settings={dSettingsHashes[game.hash]}
            />
          );
        })}
      </div>
    </aside>
  );
};

export default GamesPanel;
