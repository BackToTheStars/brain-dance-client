'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Space, message } from 'antd';

import { getTgLogsRequest } from '@/modules/admin/requests';
import AdminLayout from 'app/admin/layout';
// import moment from 'moment';
import StartDateFilter from '@/modules/admin/components/tg-logs/StartDateFilter';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'; // Для работы с UTC
import TgLogsTable from '@/modules/admin/components/tg-logs/LogsTable';
// Подключаем плагин для работы с UTC
dayjs.extend(utc);

function ChatReportPage() {
  const searchParams = useSearchParams();
  const chatId = searchParams.get('chatId');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [startDate, setStartDate] = useState(
    dayjs().subtract(1, 'hour').toISOString(),
  );
  const [endDate, setEndDate] = useState(dayjs().toISOString());

  const loadLogs = useCallback(async (cid, filter) => {
    try {
      setLoading(true);
      const data = await getTgLogsRequest(cid, filter);
      if (!data.items) throw new Error('No logs found');
      setLogs(data.items);
    } catch (err) {
      message.error(err?.message || 'Error loading logs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!chatId) return;
    loadLogs(chatId, { start: startDate, end: endDate });
  }, [chatId, startDate, endDate, loadLogs]);

  const handleFilterChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleFilterReset = () => {
    setStartDate(dayjs().subtract(1, 'hour').toISOString());
    setEndDate(dayjs().toISOString());
  };

  // Наконец, рендерим таблицу:
  return (
    <AdminLayout>
      <div className="mx-auto w-[1000px]">
        <div style={{ padding: '16px' }}>
          <h2>Chat report for chatId: {chatId}</h2>
          <Space direction="vertical" style={{ marginBottom: 16 }}>
            <StartDateFilter
              startDate={startDate}
              endDate={endDate}
              onChange={handleFilterChange}
              onReset={handleFilterReset}
            />
          </Space>
          <TgLogsTable logs={logs} loading={loading} />
        </div>
      </div>
    </AdminLayout>
  );
}

export default ChatReportPage;
