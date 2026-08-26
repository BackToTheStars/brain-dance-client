import { Button, Input } from 'antd';
import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslations } from 'next-intl';

import { TID } from '@/config/testIds';
import { lobbyEnterGameByCode } from '../../redux/actions';

// Диалог входа по неизвестному коду на `/game?hash=<код>` (ссылка из лобби).
// До него здесь был тихий автологин с ником 'user', и ник при переходе терялся.
const CodeEnterDialog = ({ code, focusTurnId }) => {
  const t = useTranslations('Lobby');
  const dispatch = useDispatch();
  const myGames = useSelector((state) => state.settings.games);
  // ник последнего входа — чтобы не набирать его заново на каждом новом коде
  const lastNickname = useMemo(() => {
    for (let i = myGames.length - 1; i >= 0; i--) {
      const codes = myGames[i]?.codes || [];
      const lastCode = codes[codes.length - 1];
      if (lastCode?.nickname) return lastCode.nickname;
    }
    return '';
  }, [myGames]);
  const [nickname, setNickname] = useState(lastNickname);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError('Заполните все поля');
      return;
    }
    setError('');
    setPending(true);
    dispatch(lobbyEnterGameByCode(code, nickname.trim(), focusTurnId)).catch(
      (msg) => {
        setPending(false);
        setError(msg);
      },
    );
  };

  return (
    <div className="flex-center h-screen">
      <div className="flex gap-2">
        <div className="w-[400px] border border-solid border-gray-300 rounded-md p-4">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <h2 className="text-2xl text-center">{t('Enter_game')}</h2>
            <div className="flex flex-col gap-2">
              <label>{t('nickname')}</label>
              <Input
                autoFocus
                data-test-id={TID.codeHandoff.nickname}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyDown={() => setError('')}
              />
            </div>
            {!!error && <div className="text-red-500">{error}</div>}
            <div className="flex justify-end">
              <Button
                htmlType="submit"
                loading={pending}
                data-test-id={TID.codeHandoff.submit}
              >
                {t('gameDialog.Go_to_the_game')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CodeEnterDialog;
