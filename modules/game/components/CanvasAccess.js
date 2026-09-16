'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import Game from '@/modules/game/components/Game';
import Loading from '@/modules/ui/components/common/Loading';
import { gameEntryUrl } from '@/modules/lobby/helpers/shareParams';
import { setOnline } from '@/modules/presence/redux/actions';
import AccessExpiredModal from '@/modules/user/components/AccessExpiredModal';
import {
  getGameInfo,
  listenAccessExpired,
  removeGameInfo,
  useUserContext,
} from '@/modules/user/contexts/UserContext';
import {
  RENEW_DONE,
  RENEW_EXPIRED,
  RENEW_REFUSED,
  renewAccessIfDue,
} from '@/modules/user/renewAccess';
import { renewalDelayMs } from '@/modules/user/token';

// The canvas opens after the stored token is checked; the check repeats whenever
// the tab becomes visible again and on a timer at half of the token's lifetime.
const CanvasAccess = ({ hash, focusTurnId, tourId }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { reloadUserInfo, token } = useUserContext();
  const [checked, setChecked] = useState(false);
  const [expired, setExpired] = useState(false);
  const rearmTimer = useRef(null);

  useEffect(() => {
    const entryUrl = gameEntryUrl(hash, { focusTurnId, tourId });
    if (!getGameInfo(hash)?.token) {
      // no token: the entry dialog, keeping the turn and the tour from the link
      router.push(entryUrl);
      return;
    }
    let active = true;
    let timerId = null;
    const stopTimer = () => clearTimeout(timerId);
    const armTimer = () => {
      stopTimer();
      const current = getGameInfo(hash)?.token;
      if (current) timerId = setTimeout(check, renewalDelayMs(current));
    };
    const check = () =>
      renewAccessIfDue(hash).then((result) => {
        if (!active) return;
        if (result === RENEW_EXPIRED) {
          stopTimer();
          setExpired(true);
          return;
        }
        if (result === RENEW_REFUSED) {
          stopTimer();
          removeGameInfo(hash);
          router.push(entryUrl);
          return;
        }
        if (result === RENEW_DONE) reloadUserInfo();
        setChecked(true);
        armTimer();
      });
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') check();
    };

    check();
    rearmTimer.current = armTimer;
    document.addEventListener('visibilitychange', onVisibilityChange);
    const stopListening = listenAccessExpired((expiredHash) => {
      if (expiredHash === hash) setExpired(true);
    });
    return () => {
      active = false;
      rearmTimer.current = null;
      stopTimer();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      stopListening();
    };
  }, [hash]);

  // A token replaced by a renewal, the socket or a login moves the half-life.
  useEffect(() => {
    rearmTimer.current?.();
  }, [token]);

  // An expired token cannot be renewed, so either choice drops the record.
  const backToLobby = () => {
    removeGameInfo(hash);
    window.location.assign('/');
  };
  const stayVisitor = () => {
    removeGameInfo(hash);
    reloadUserInfo();
    dispatch(setOnline(false));
    setExpired(false);
    setChecked(true);
  };

  return (
    <>
      {checked ? (
        <Game hash={hash} focusTurnId={focusTurnId} tourId={tourId} />
      ) : (
        <Loading />
      )}
      <AccessExpiredModal
        open={expired}
        onLobby={backToLobby}
        onStay={stayVisitor}
      />
    </>
  );
};

export default CanvasAccess;
