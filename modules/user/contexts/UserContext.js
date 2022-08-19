import { setRequestSettings } from '@/config/request';
import { checkRuleByRole, ROLE_GAME_VISITOR } from '@/config/user';
import { setUserToken } from '@/modules/game/requests';
import { createContext, useContext, useState, useEffect } from 'react';

const GAME_KEY_PREFIX = 'game_';

// game info functions
export const setGameInfoIntoStorage = (hash, data) => {
  // info (hash, nickname, role)
  // token
  // @todo fixme
  // setUserToken(data?.token);
  setRequestSettings(hash, data?.token);
  localStorage.setItem(`${GAME_KEY_PREFIX}${hash}`, JSON.stringify(data));
};
const removeGameInfo = (hash) => {
  // @todo fixme
  // setUserToken(null);
  setRequestSettings(null, null);
  return localStorage.removeItem(`${GAME_KEY_PREFIX}${hash}`);
};
const getGameInfo = (hash) => {
  if (typeof window === 'undefined') {
    return null; // get guest info
  }

  const data = JSON.parse(localStorage.getItem(`${GAME_KEY_PREFIX}${hash}`));
  // @todo fixme
  // setUserToken(data?.token);
  setRequestSettings(hash, data?.token);
  return data;
};

export const logOut = () => {
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
  const { info, token } = getGameInfo(hash) || guestUser;

  const can = (rule) => checkRuleByRole(rule, info.role);

  const value = {
    info,
    token,
    can,
  };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => useContext(UserContext);
