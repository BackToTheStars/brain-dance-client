import { useState, useContext, useReducer, createContext } from 'react';
import { getGameInfo } from '../../src/lib/gameToken';
import { checkRuleByRole } from '../config';
import { API_URL } from '../../src/config';

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

  // classes
  // получение классов
  const request = async (
    path,
    { body = null, tokenFlag = false, method = 'GET' } = {},
    { errorMessage } = {}
  ) => {
    let defaultMessage =
      errorMessage || `Произошла ошибка service.js:187, метод ${method}`;
    const params = {
      method,
      headers: {
        'content-type': 'application/json',
      },
    };
    if (tokenFlag) {
      params.headers['game-token'] = token;
    }
    if (body) {
      params.body = JSON.stringify(body);
    }

    return new Promise((resolve, reject) => {
      fetch(`${API_URL}/${path}`, params)
        .then((data) => {
          return data.json();
        })
        .then((res) => {
          const { message = defaultMessage, item, items } = res;
          // @todo: более гибкая обработка
          if (item || items) {
            resolve(res);
          } else {
            alert(message);
          }
        })
        .catch((err) => {
          console.log(err);
          reject('Request error');
        });
    });
  };

  const value = {
    info,
    token,
    can,
    timecode,
    request,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => useContext(UserContext);
