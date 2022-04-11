import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
// import { NOTIFICATION_TRANSITION, useUiContext } from '../contexts/UI_Context';
const NOTIFICATION_TRANSITION = 2000;

const Notifications = () => {
  //

  const notifications = useSelector((state) => state.ui.notifications);

  // const notifications = [
  //   { status: 'active', title: 'Info', text: '1st notification' },
  // ];

  // const [notesToShow, setNotesToShow] = useState(notes);
  // useEffect(() => {
  //   setNotesToShow(notes);
  // }, [notes]);
  // timespan

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
