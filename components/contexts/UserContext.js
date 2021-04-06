import { useState, useContext, useReducer, createContext } from 'react';
import { getGameInfo } from '../../src/lib/gameToken';
import { checkRuleByRole } from '../config';

const guestUser = {
  info: {
    nickname: 'Guest',
    role: 1, // @todo: use client constants
  },
};

export const UserContext = createContext();

export const UserProvider = ({ children, hash, timecode }) => {
  // info (hash, nickname, role)
  // token
  guestUser.info.hash = hash;
  const { info, token } = getGameInfo(hash) || guestUser;
  const can = function (rule) {
    return checkRuleByRole(rule, info.role);
  };

  const value = {
    info,
    token,
    can,
    timecode,
  };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => useContext(UserContext);
