const ADMIN_TOKEN_KEY = 'admin_token_key';

const getToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem(ADMIN_TOKEN_KEY);
};

const setToken = (token) => {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
};

module.exports = {
  getToken,
  setToken,
};
