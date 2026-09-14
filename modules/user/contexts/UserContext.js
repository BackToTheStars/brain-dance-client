'use client'
import { setRequestSettings } from '@/config/request';
import { checkRuleByRole, ROLE_GAME_VISITOR } from '@/config/user';
// import { setUserToken } from '@/modules/game/requests';
import { createContext, useContext, useState, useEffect } from 'react';

const GAME_KEY_PREFIX = 'game_';

// game info functions
// Только запись: запросы страницы остаются на своей игре.
export const saveGameInfo = (hash, data) =>
  localStorage.setItem(`${GAME_KEY_PREFIX}${hash}`, JSON.stringify(data));
export const setGameInfoIntoStorage = (hash, data) => {
  // info (hash, nickname, role)
  // token
  // @todo fixme
  // setUserToken(data?.token);
  setRequestSettings(hash, data?.token);
  saveGameInfo(hash, data);
};
export const removeGameInfo = (hash) => {
  // @todo fixme
  // setUserToken(null);
  setRequestSettings(null, null);
  return localStorage.removeItem(`${GAME_KEY_PREFIX}${hash}`);
};
const loadGameInfo = (hash) => {
  if (typeof window === 'undefined') {
    return null; // get guest info
  }

  const data = JSON.parse(localStorage.getItem(`${GAME_KEY_PREFIX}${hash}`));
  // @todo fixme
  // setUserToken(data?.token);
  setRequestSettings(hash, data?.token);
  // запись без токена ничего не даёт, а как truthy `{}` отключила бы откат на гостя
  return data?.token ? data : null;
};

export const getGameInfo = (hash) => {
  if (typeof window === 'undefined') {
    return null; // get guest info
  }

  const data = JSON.parse(localStorage.getItem(`${GAME_KEY_PREFIX}${hash}`));
  return data;
}

// Сокет присутствия живёт вне React: об истёкшем токене он сообщает сюда, а
// спрашивает пользователя холст. false — слушать некому.
const expiredListeners = new Set();
export const listenAccessExpired = (listener) => {
  expiredListeners.add(listener);
  return () => {
    expiredListeners.delete(listener);
  };
};
export const reportAccessExpired = (hash) => {
  expiredListeners.forEach((listener) => listener(hash));
  return expiredListeners.size > 0;
};

export const logOut = (hash) => {
  removeGameInfo(hash); // стираем token из LocalStorage
  window.location.reload(); // перезагружаем игру по тому же адресу
};

const guestUser = {
  info: {
    nickname: 'Guest',
    role: ROLE_GAME_VISITOR,
  },
};

const UserContext = createContext();

export const UserProvider = ({ children, hash }) => {
  const [userInfo, setUserInfo] = useState(loadGameInfo(hash) || guestUser);
  const { info, token } = userInfo;

  const can = (rule) => checkRuleByRole(rule, info.role);
  // Откат на гостя обязателен: перезагрузка после снятия негодного доступа
  // не находит записи, и без него весь контекст становится null.
  const reloadUserInfo = () => setUserInfo(loadGameInfo(hash) || guestUser);

  const value = {
    info,
    token,
    can,
    reloadUserInfo,
  };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => useContext(UserContext);
