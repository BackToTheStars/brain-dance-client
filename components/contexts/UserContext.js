import { useState, useContext, useReducer, createContext } from 'react';
import { getGameInfo, removeGameInfo } from '../lib/gameToken';
import { checkRuleByRole } from '../config';
import { API_URL } from '../config';

const guestUser = {
  info: {
    nickname: 'Guest',
    role: 1, // @todo: use client constants
  },
};

export const UserContext = createContext();

const saveIntoLocalStorage = (value, field) => {
  localStorage.setItem(field, JSON.stringify(value));
};

const loadFromLocalStorage = (field) => {
  // может быть вызвана на стороне Server Side rendering SSR
  return localStorage.getItem(field)
    ? JSON.parse(localStorage.getItem(field))
    : null;
};

const removeFromLocalStorage = (field) => {
  localStorage.removeItem(field);
};

export const UserProvider = ({ children, hash, timecode }) => {
  // info (hash, nickname, role)
  // token
  guestUser.info.hash = hash;
  const { info, token } = getGameInfo(hash) || guestUser;
  const can = function (rule) {
    return checkRuleByRole(rule, info.role);
  };

  const logOut = () => {
    removeGameInfo(hash); // стираем token из LocalStorage
    window.location.reload(); // перезагружаем игру по тому же адресу
  };

  const [isTurnInBuffer, setIsTurnInBuffer] = useState(
    !!loadFromLocalStorage('saved_turn')
  );

  const saveTurnInBuffer = (turn) => {
    saveIntoLocalStorage(turn, 'saved_turn');
    setIsTurnInBuffer(true);
  };

  const getTurnFromBufferAndRemove = (turn) => {
    const res = loadFromLocalStorage('saved_turn');
    removeFromLocalStorage('saved_turn');
    setIsTurnInBuffer(false);
    return res;
  };

  // classes
  // получение классов
  const request = async (
    path,
    { body = null, tokenFlag = false, method = 'GET' } = {},
    { errorMessage, errorCallback, successCallback } = {}
  ) => {
    let defaultMessage = errorMessage || `Произошла ошибка, метод ${method}`;
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
            if (successCallback) {
              successCallback(res);
            }
          } else {
            if (errorCallback) {
              errorCallback(message);
            } else {
              alert(message);
            }
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
    timecode, // @todo: проверить, нужен ли
    request,
    saveTurnInBuffer,
    getTurnFromBufferAndRemove,
    isTurnInBuffer,
    logOut,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => useContext(UserContext);
