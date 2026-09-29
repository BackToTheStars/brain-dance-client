'use client';

import { useEffect, useState } from 'react';
import { Alert, Button, Modal } from 'antd';
import { useTranslations } from 'next-intl';
import { API_URL, LOBBY_URL } from '@/config/server';
import { TID } from '@/config/testIds';
import {
  getStore,
  settingsStorageKey,
} from '@/modules/settings/redux/requests';
import {
  accessExportFileName,
  buildAccessExport,
  gamesWithCodes,
} from '@/modules/settings/utils/accessExport';
import { siteDataKeys } from '@/modules/settings/utils/siteData';

const SITE_NAME = 'Brain Dance';

const downloadJson = (data, fileName) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
};

const readGames = () => {
  try {
    return gamesWithCodes(getStore().games);
  } catch {
    // испорченное хранилище читается как пустое
    return [];
  }
};

// Сюда перед переездом лобби поведёт `/` (правило nginx); из интерфейса ссылок нет.
// Хранилище читается и по подтверждению очищается; импорта здесь нет.
const LobbyMovedPage = () => {
  const t = useTranslations('LobbyMoved');
  // null — хранилище ещё не прочитано: оно есть только в браузере
  const [games, setGames] = useState(null);
  // число в тексте окна не меняется, пока оно закрывается после очистки
  const [confirm, setConfirm] = useState({ open: false, count: 0 });
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    setGames(readGames());
  }, []);

  const closeConfirm = () =>
    setConfirm((current) => ({ ...current, open: false }));

  const clearSiteData = () => {
    const keys = siteDataKeys(Object.keys(localStorage), settingsStorageKey);
    keys.forEach((key) => localStorage.removeItem(key));
    setGames(readGames());
    setCleared(true);
    closeConfirm();
  };

  const exportAccess = () => {
    const data = buildAccessExport(games, {
      api: API_URL,
      canvas: window.location.origin,
      name: SITE_NAME,
    });
    downloadJson(data, accessExportFileName());
  };

  return (
    <div className="game-bg">
      <div className="relative z-[2] h-full overflow-y-auto flex justify-center items-center p-4">
        <div
          className="w-[560px] max-w-full border border-solid border-gray-300 rounded-md p-4 flex flex-col gap-4"
          data-test-id={TID.lobbyMoved.page}
        >
          <h2 className="text-2xl text-center">{t('Title')}</h2>
          <p>{t('Moved')}</p>
          {cleared && (
            <p data-test-id={TID.lobbyMoved.cleared}>{t('Cleared')}</p>
          )}
          {games?.length === 0 && (
            <p data-test-id={TID.lobbyMoved.empty}>{t('Empty')}</p>
          )}
          {games?.length > 0 && (
            <>
              <p>{t('Export_hint')}</p>
              <div
                data-test-id={TID.lobbyMoved.count}
                data-count={games.length}
              >
                {t('Games_count', { count: games.length })}
              </div>
              <ul className="max-h-[40vh] overflow-y-auto flex flex-col gap-1">
                {games.map((game, index) => (
                  <li
                    key={game.hash || index}
                    className="flex justify-between gap-4"
                    data-test-id={TID.lobbyMoved.game}
                    data-hash={game.hash}
                    data-codes={game.codes.length}
                  >
                    <span>{game.hash || '—'}</span>
                    <span>
                      {t('Codes_count', { count: game.codes.length })}
                    </span>
                  </li>
                ))}
              </ul>
              <Alert type="warning" showIcon title={t('Secret_warning')} />
              <Button
                type="primary"
                onClick={exportAccess}
                data-test-id={TID.lobbyMoved.export}
              >
                {t('Export')}
              </Button>
            </>
          )}
          {!!LOBBY_URL && (
            <Button href={LOBBY_URL} data-test-id={TID.lobbyMoved.link}>
              {t('Open_new_lobby')}
            </Button>
          )}
          <Button
            danger
            onClick={() =>
              setConfirm({ open: true, count: games?.length ?? 0 })
            }
            data-test-id={TID.lobbyMoved.clear}
          >
            {t('Clear')}
          </Button>
        </div>
      </div>
      {/* Управляемый Modal, а не Modal.confirm: статические методы antd не видят тему. */}
      <Modal
        open={confirm.open}
        title={t('Clear_title')}
        okText={t('Clear_ok')}
        cancelText={t('Clear_cancel')}
        okButtonProps={{
          danger: true,
          'data-test-id': TID.lobbyMoved.clearOk,
        }}
        cancelButtonProps={{ 'data-test-id': TID.lobbyMoved.clearCancel }}
        onOk={clearSiteData}
        onCancel={closeConfirm}
      >
        <p
          className="mb-0"
          data-test-id={TID.lobbyMoved.clearConfirm}
          data-count={confirm.count}
        >
          {confirm.count > 0
            ? t('Clear_confirm', { count: confirm.count })
            : t('Clear_confirm_empty')}
        </p>
      </Modal>
    </div>
  );
};

export default LobbyMovedPage;
