import { API_URL } from '@/config/server';
import { USER_MODE_ADMIN, USER_MODE_VISITOR } from '@/config/user';
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { loginRequest, setAdminToken } from '../requests';
const SUPER_ADMIN_TOKEN_KEY = 'super_admin_token_key';

const defaultAdminUser = {
  mode: USER_MODE_VISITOR,
  token: null,
  loaded: false,
};

const getTokenFromStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  // @todo: fixme
  setAdminToken(localStorage.getItem(SUPER_ADMIN_TOKEN_KEY));
  return localStorage.getItem(SUPER_ADMIN_TOKEN_KEY);
};

const setTokenIntoStorage = (token) => {
  localStorage.setItem(SUPER_ADMIN_TOKEN_KEY, token);
  // @todo: fixme
  setAdminToken(token);
};

const AdminContext = createContext();

// MAIN ADMIN PROVIDER CONTEXT
export const AdminProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(defaultAdminUser);

  useEffect(() => {
    const token = getTokenFromStorage();
    if (token) {
      setAdminUser({
        mode: USER_MODE_ADMIN,
        token,
        loaded: true,
      });
    } else {
      setAdminUser({
        ...defaultAdminUser,
        loaded: true,
      });
    }
  }, []);

  const login = ({ nickname, password }, onSuccess) => {
    loginRequest({ nickname, password }).then((data) => {
      const { token } = data;
      setTokenIntoStorage(token);
      onSuccess();
    });
  };

  const value = {
    adminUser,
    login,
  };
  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};

export const useAdminContext = () => useContext(AdminContext);
