import { API_URL } from './config';
import { getGameInfo } from './lib/gameToken';
import { checkRuleByRole, RULE_TURNS_CRUD } from '../components/config';

/** USER INFO */
const urlParams = new URLSearchParams(window.location.search);
const HASH = urlParams.get('hash');

const guestUser = {
  info: {
    hash: HASH,
    nickname: 'Guest',
    role: 1, // @todo: use client constants
  },
};
let user = guestUser;
try {
  user = getGameInfo(HASH) || guestUser;
  console.log(`service.js line 17:  user loaded: ${user}`);
} catch (e) {
  console.log('No user info');
  console.log({ e });
}

user.can = function (rule) {
  return checkRuleByRole(rule, this.info.role);
};

const getUser = () => {
  return user;
};

/** USER INFO */

const getTurns = async () =>
  new Promise((resolve, reject) => {
    $.ajax({
      type: 'GET',
      url: `${API_URL}/turns?hash=${HASH}`,
      success: resolve,
      error: reject,
    });
  });

const createTurn = async (turnObj) => {
  return new Promise(async (resolve, reject) => {
    fetch(`${API_URL}/turns?hash=${HASH}`, {
      // @todo: лучше везде делать fetch()
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'game-token': user.token,
      },
      body: JSON.stringify(turnObj),
    })
      .then((data) => {
        return data.json();
      })
      .then((res) => {
        const { message = 'Произошла ошибка', item } = res;
        if (item) {
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

const updateTurn = async (turnObj) => {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: 'PUT',
      url: `${API_URL}/turns/${turnObj._id}?hash=${HASH}`,
      data: JSON.stringify(turnObj),
      dataType: 'json',
      headers: {
        'game-token': user.token,
      },
      contentType: 'application/json',
      success: resolve,
      error: reject,
    });
  });
};

const deleteTurn = async (turnObj) => {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: 'DELETE',
      url: `${API_URL}/turns/${turnObj._id}?hash=${HASH}`,
      dataType: 'json',
      headers: {
        'game-token': user.token,
      },
      contentType: 'application/json',
      success: resolve,
      error: reject,
    });
  });
};

const turnsUpdateCoordinates = async (turns) =>
  new Promise((resolve, reject) => {
    $.ajax({
      type: 'PUT',
      url: `${API_URL}/turns/coordinates?hash=${HASH}`,
      data: JSON.stringify({
        turns,
      }),
      dataType: 'json',
      contentType: 'application/json',
      headers: {
        'game-token': user.token,
      },
      success: resolve,
      error: reject,
    });
  });

const getRedLogicLines = async () =>
  new Promise((resolve, reject) => {
    $.ajax({
      type: 'GET',
      url: `${API_URL}/game?hash=${HASH}`,
      success: resolve,
      error: reject,
    });
  });

const updateRedLogicLines = async (redLogicLines) =>
  new Promise((resolve, reject) => {
    $.ajax({
      type: 'PUT',
      url: `${API_URL}/game/red-logic-lines?hash=${HASH}`,
      data: JSON.stringify({
        redLogicLines,
      }),
      dataType: 'json',
      contentType: 'application/json',
      headers: {
        'game-token': user.token,
      },
      success: resolve,
      error: reject,
    });
  });

const createRedLogicLine = async (line) =>
  new Promise((resolve, reject) => {
    $.ajax({
      type: 'POST',
      url: `${API_URL}/game/red-logic-lines?hash=${HASH}`,
      data: JSON.stringify(line),
      dataType: 'json',
      contentType: 'application/json',
      headers: {
        'game-token': user.token,
      },
      success: resolve,
      error: reject,
    });
  });

const deleteLines = async (redLogicLines) => {
  new Promise((resolve, reject) => {
    $.ajax({
      type: 'DELETE',
      url: `${API_URL}/game/red-logic-lines?hash=${HASH}`,
      data: JSON.stringify({
        redLogicLines,
      }),
      dataType: 'json',
      contentType: 'application/json',
      headers: {
        'game-token': user.token,
      },
      success: resolve,
      error: reject,
    });
  });
};

// classes
// получение классов
const request = async (
  url,
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
    params.headers['game-token'] = user.token;
  }
  if (body) {
    params.body = JSON.stringify(body);
  }

  return new Promise((resolve, reject) => {
    fetch(url, params)
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

const getClasses = async () => request(`${API_URL}/game-classes?hash=${HASH}`);

const createClass = async (body) =>
  request(`${API_URL}/game-classes?hash=${HASH}`, {
    method: 'POST',
    body,
    tokenFlag: true,
  });

const updateClass = async (id, body) =>
  request(`${API_URL}/game-classes/${id}?hash=${HASH}`, {
    method: 'PUT',
    tokenFlag: true,
    body,
  });

const deleteClass = async (id) =>
  request(`${API_URL}/game-classes/${id}?hash=${HASH}`, {
    method: 'DELETE',
    tokenFlag: true,
  });

export {
  getTurns,
  createTurn,
  updateTurn,
  deleteTurn,
  turnsUpdateCoordinates,
  getRedLogicLines,
  updateRedLogicLines,
  createRedLogicLine,
  deleteLines,
  // getUser,
  getClasses,
  createClass,
  updateClass,
  deleteClass,
};
