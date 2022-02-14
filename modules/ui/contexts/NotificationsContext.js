import { createContext, useContext, useState } from 'react';

const NotificationsContext = createContext();
export const NOTIFICATION_TRANSITION = 500;

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const addNotification = ({ title, text }) => {
    const newNotifications = [...notifications, { title, text, status: 'new' }];
    setNotifications(newNotifications);
    setTimeout(() => {
      setNotifications((notifications) => {
        const newNotifications = [...notifications];
        newNotifications[0] = {
          ...newNotifications[0],
          status: 'old',
        };
        return newNotifications;
      });
    }, 3000);

    setTimeout(() => {
      setNotifications((notifications) => {
        const newNotifications = [...notifications];
        newNotifications.shift();
        return newNotifications;
      });
    }, 3000 + NOTIFICATION_TRANSITION);
  };

  const value = { notifications, addNotification };
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};

export const useNotifications = () => useContext(NotificationsContext);