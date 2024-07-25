import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
const NOTIFICATION_TRANSITION = 2000;

const Notifications = () => {
  const notifications = useSelector((state) => state.ui.notifications);
  return (
    <>
      {notifications.map((notification, index) => (
        <div
          key={index}
          className={`notification ${notification.status}`}
          style={{ transition: `${NOTIFICATION_TRANSITION}ms` }}
        >
          <div className="title">{notification.title}</div>
          <div className="text">{notification.text}</div>
        </div>
      ))}
    </>
  );
};

export default Notifications;
