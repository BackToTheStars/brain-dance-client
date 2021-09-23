import { useState, useEffect } from 'react';
import { NOTIFICATION_TRANSITION, useUiContext } from '../contexts/UI_Context';

const NotificationPanel = () => {
  //
  const { notifications } = useUiContext();

  // const [notesToShow, setNotesToShow] = useState(notes);
  // useEffect(() => {
  //   setNotesToShow(notes);
  // }, [notes]);
  // timespan

  return (
    <div id="notificationPanel">
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
    </div>
  );
};

export default NotificationPanel;
