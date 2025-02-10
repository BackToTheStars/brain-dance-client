import { LOG_TYPE } from '@/config/logs';
import { Table, Tag } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import { JSONTree } from 'react-json-tree';

import {
  FaPhotoVideo,
  FaFileAudio,
  FaFile,
  FaVideo,
  FaLayerGroup,
  FaMarkdown,
} from 'react-icons/fa';
import { TbMessageForward } from 'react-icons/tb';

const formatFileSize = (bytes) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
};

const renderMediaInfo = (msgData) => {
  if (!msgData.mediaInfo) return null;

  const { type, file_size } = msgData.mediaInfo;

  // Выбор иконки в зависимости от типа медиа
  let icon;
  switch (type) {
    case 'photo':
      icon = <FaPhotoVideo />;
      break;
    case 'video':
      icon = <FaVideo />;
      break;
    case 'audio':
      icon = <FaFileAudio />;
      break;
    default:
      icon = <FaFile />;
      break;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {!!msgData.mediaGroupId && <FaLayerGroup />}
      {icon}
      <span>
        {type === 'photo'
          ? 'Photo'
          : type === 'video'
            ? 'Video'
            : type === 'audio'
              ? 'Audio'
              : 'File'}
        {file_size && `, ${formatFileSize(file_size)}`}
      </span>
    </div>
  );
};

const renderPreviewInfo = (msgData) => {
  if (!msgData.previewInfo) return null;

  const { type } = msgData.previewInfo;
  let icon;
  switch (type) {
    case 'photo':
      icon = <FaPhotoVideo />;
      break;
    case 'video':
      icon = <FaVideo />;
      break;
    default:
      icon = <FaFile />;
      break;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      LinkPreview {icon}
      <span>
        {type === 'photo' ? 'Photo' : type === 'video' ? 'Video' : 'File'}
      </span>
    </div>
  );
};

const ScrollContainer = ({ children }) => {
  return (
    <div
      style={{
        // maxWidth: '100%',
        maxWidth: '300px',
        overflowX: 'auto',
        maxHeight: '300px',
        overflowY: 'auto',
      }}
    >
      {children}
    </div>
  );
};

const groupLogsByUserMessage = (logs) => {
  const groupedLogs = [];
  let currentGroup = null;

  logs.forEach((log) => {
    if (log.type === 'user_message' || log.type === 'user_callback') {
      console.log('new group');
      // Начинаем новую группу
      currentGroup = {
        ...log,
        children: [], // Дочерние логи
      };
      groupedLogs.push(currentGroup);
    } else if (currentGroup) {
      // Добавляем логи в текущую группу
      currentGroup.children.push(log);
    }
  });

  return groupedLogs;
};

const getMsgData = (msg) => {
  try {
    return JSON.parse(msg);
  } catch (err) {
    return {};
  }
};

const getObjOrStr = (item) => {
  try {
    return JSON.parse(item);
  } catch (err) {
    return item;
  }
};

const FullMessage = ({ message }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div>
      <a
        href="#"
        className="color-blue-600"
        onClick={(e) => {
          e.preventDefault();
          setIsVisible(!isVisible);
        }}
      >
        {isVisible ? 'Hide' : 'Show'}
      </a>
      {isVisible && (
        <ScrollContainer>
          <JSONTree data={getObjOrStr(message)} />
        </ScrollContainer>
      )}
    </div>
  );
};

const LogTypeSettings = {
  [LOG_TYPE.USER_MESSAGE]: {
    title: 'Сообщение',
    color: 'green',
  },
  [LOG_TYPE.USER_CALLBACK]: {
    title: 'Нажатие кнопки',
    color: 'green',
  },
  [LOG_TYPE.BOT_REPLY]: {
    title: 'Ответ бота',
    color: 'blue',
  },
  [LOG_TYPE.XSTATE_TRANSITION]: {
    title: 'Переход состояния',
    color: 'yellow',
  },
  [LOG_TYPE.MSG_SERVICE_RUN]: {
    title: 'Запуск сервиса',
    color: 'yellow',
  },
};

const TgLogsTable = ({ logs }) => {
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  // Преобразуем логи в иерархическую структуру
  const groupedLogs = groupLogsByUserMessage(logs);

  // Колонки таблицы
  const columns = [
    {
      title: 'User Action',
      dataIndex: 'type',
      key: 'type',
      width: '30%',
      render: (type, log) => {
        const msgData = getMsgData(log.message);
        const settings = LogTypeSettings[type];
        if ([LOG_TYPE.USER_MESSAGE, LOG_TYPE.USER_CALLBACK].includes(type)) {
          return (
            <div className="flex flex-col max-w-[300px] overflow-x-auto">
              <div>
                <Tag color={settings.color}>
                  <b>
                    {settings.title} ({log.children.length})
                  </b>
                </Tag>
              </div>
              {msgData.text && (
                <div className="flex gap-2 items-center">
                  <b>{msgData.hasEntities && <FaMarkdown />}</b>
                  <b>
                    {msgData.text.length <= 100
                      ? msgData.text
                      : msgData.text.slice(0, 50) + '...'}
                  </b>
                </div>
              )}
              {msgData.isForward && (
                <div className="flex gap-2 items-center">
                  <b>
                    <TbMessageForward />
                  </b>{' '}
                  Forward
                </div>
              )}
              {msgData.mediaInfo && renderMediaInfo(msgData)}
              {msgData.previewInfo && renderPreviewInfo(msgData)}
              {msgData.data && (
                <div>
                  <b>{msgData.data}</b>
                </div>
              )}
              <div>{dayjs(log.timestamp).format('DD.MM.YYYY HH:mm:ss')}</div>
            </div>
          );
        }
        return null;
      },
    },
    {
      title: 'Detail Logs',
      dataIndex: 'type',
      key: 'type',
      width: '40%',
      render: (type, log) => {
        if (
          [
            LOG_TYPE.USER_MESSAGE,
            LOG_TYPE.USER_CALLBACK,
            LOG_TYPE.BOT_REPLY,
          ].includes(log.type)
        ) {
          return (
            <div>
              <FullMessage message={log.message} />
            </div>
          );
        }
        const msgData = getMsgData(log.message);
        const settings = LogTypeSettings[type];
        return (
          <div>
            <Tag color={settings.color || 'yellow'}>
              {settings.title || type}
            </Tag>
            {LOG_TYPE.XSTATE_TRANSITION === log.type && (
              <b>{msgData.newState.value}</b>
            )}
            {LOG_TYPE.MSG_SERVICE_RUN === log.type && <b>{msgData.command}</b>}
            <FullMessage message={log.message} />
          </div>
        );
      },
    },
    {
      title: 'Bot Reply',
      dataIndex: 'type',
      key: 'type',
      width: '30%',
      render: (type, log) => {
        const msgData = getMsgData(log.message);
        const settings = LogTypeSettings[type];
        if (type === LOG_TYPE.BOT_REPLY) {
          return (
            <div className="flex flex-col">
              <div>
                <Tag color={settings.color}>{settings.title}</Tag>
              </div>
              {msgData.repliedTo && (
                <div>
                  <b>Replied to:</b> {msgData.repliedTo}
                </div>
              )}
              {msgData.text && <div>{msgData.text}</div>}
              {msgData.buttons && (
                <div className="flex flex-col gap-1">
                  {msgData.buttons.map(({ text }) => (
                    <Tag key={text}>
                      <div className="flex items-center justify-center">
                        {text}
                      </div>
                    </Tag>
                  ))}
                </div>
              )}
            </div>
          );
        }

        return null;
      },
    },
  ];

  // Управление раскрытием строк
  const handleExpand = (expanded, record) => {
    if (expanded) {
      setExpandedRowKeys([...expandedRowKeys, record._id]);
    } else {
      setExpandedRowKeys(expandedRowKeys.filter((_id) => _id !== record._id));
    }
  };

  return (
    <Table
      columns={columns}
      dataSource={groupedLogs}
      rowKey={(record) => record._id}
      expandable={{
        expandedRowKeys,
        onExpand: handleExpand,
        childrenColumnName: 'children', // Указываем поле для дочерних элементов
        rowExpandable: (record) =>
          record.children && record.children.length > 0, // Раскрываем только группы
      }}
      pagination={false}
    />
  );
};

export default TgLogsTable;
