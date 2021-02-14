const SUPER_ADMIN_TOKEN_KEY = 'super_admin_token_key';

const getToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem(SUPER_ADMIN_TOKEN_KEY);
};

const setToken = (token) => {
  localStorage.setItem(SUPER_ADMIN_TOKEN_KEY, token);
};

module.exports = {
  getToken,
  setToken,
};
