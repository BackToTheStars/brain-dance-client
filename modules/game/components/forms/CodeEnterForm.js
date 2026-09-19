import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Input } from 'antd';
import { useTranslations } from 'next-intl';
import { getGameUserTokenRequest } from '../../requests';
import {
  saveGameInfo,
  setGameInfoIntoStorage,
  useUserContext,
} from '@/modules/user/contexts/UserContext';
import { reconnectWithNewAccess } from '@/modules/presence/redux/actions';
import { addGameCode, loadSettings } from '@/modules/settings/redux/actions';
import { TID } from '@/config/testIds';
import { gameEntryUrl } from '@/modules/lobby/helpers/shareParams';

const CodeEnterForm = ({ hash }) => {
  const dispatch = useDispatch();
  const t = useTranslations('Game.codeEnterForm');
  const { reloadUserInfo } = useUserContext();
  const [accessCode, setAccessCode] = useState('');
  const [userNickname, setUserNickname] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [otherGameHash, setOtherGameHash] = useState('');

  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    setOtherGameHash('');
    getGameUserTokenRequest(accessCode, userNickname).then((data) => {
      // Без адреса игры доступ сохранять некуда: запись ушла бы в ключ
      // game_undefined, а в настройки — игра без адреса.
      if (data.success && data.info?.hash) {
        const { info, token } = data;
        // На холсте список игр в store не загружен, а addGameCode пишет его в
        // хранилище целиком — без loadSettings сохранённые игры стёрлись бы.
        dispatch(loadSettings());
        dispatch(
          addGameCode({
            hash: info.hash,
            nickname: info.nickname,
            role: info.role,
            code: info.code,
          }),
        );
        if (info.hash !== hash) {
          saveGameInfo(info.hash, { info, token });
          setOtherGameHash(info.hash);
          return;
        }
        setGameInfoIntoStorage(info.hash, {
          info,
          token,
        });
        dispatch(reconnectWithNewAccess({ reloadUserInfo }));
        setTimeout(() => {
          reloadUserInfo();
        }, 300)
      } else {
        setErrorMessage(data?.message || t('Unknown_error'));
      }
    });
    //setShowCreateModal(true)

    /*if (!accessCode) {
      setErrorMessage('Enter access code');
    } else if (!userNickname) {
      setErrorMessage('Enter your nickname');
    } else {
      //enterGame(accessCode, userNickname);
      setShowCreateModal(true)
    }*/
  };

  return (
    <form className="row" onSubmit={handleSubmit}>
      <div className="col-auto mb-2">
        <Input
          size="small"
          name="code"
          type="text"
          className="form-control"
          placeholder={t('Code_placeholder')}
          data-test-id={TID.codeEnter.code}
          onChange={(e) => setAccessCode(e.target.value)}
          value={accessCode}
          onKeyDown={() => setErrorMessage('')}
        />
      </div>
      <div className="col-auto mb-2">
        <Input
          size="small"
          name="nickname"
          type="text"
          className="form-control"
          placeholder={t('Nickname_placeholder')}
          data-test-id={TID.codeEnter.nickname}
          onChange={(e) => setUserNickname(e.target.value)}
          value={userNickname}
          onKeyDown={() => setErrorMessage('')}
        />
      </div>
      <div className="col-auto mb-2">
        <Button
          size="small"
          htmlType="submit"
          className="enter-game"
          data-test-id={TID.codeEnter.submit}
        >
          {t('Submit')}
        </Button>
      </div>
      {!!errorMessage && <div className="text-danger mb-2">{errorMessage}</div>}
      {!!otherGameHash && (
        <div className="mb-2" data-test-id={TID.codeEnter.otherGame}>
          {t('Other_game_notice')}{' '}
          <a href={gameEntryUrl(otherGameHash)}>{t('Open_it')}</a>
        </div>
      )}
    </form>
  );
};

export default CodeEnterForm;
