import { useState, useEffect } from 'react';

const NotificationPanel = ({ notes }) => {
  const [notesToShow, setNotesToShow] = useState(notes);
  useEffect(() => {
    setNotesToShow(notes);
  }, [notes]);
  // timespan

  return (
    <div id="notificationPanel">
      {notesToShow.map((noteToShow, index) => (
        <div key={index} className="notification">
          <div className="not-title">{noteToShow.msgTitle}</div>
          <div className="not-text">{noteToShow.msgText}</div>
        </div>
      ))}
    </div>
  );
};

export default NotificationPanel;
