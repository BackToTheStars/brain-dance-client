'use client';

import { useState, useEffect } from 'react';
import { List, message } from 'antd';
import Link from 'next/link';
import { getTgChatIdsRequest } from '@/modules/admin/requests';
import AdminLayout from '../layout';

function ChatIdsPage() {
  const [chatIds, setChatIds] = useState([]);

  useEffect(() => {
    getTgChatIdsRequest()
      .then((data) => setChatIds(data.items || []))
      .catch((err) => {
        // adminRequest поднимает Error с текстом сервера — показываем его,
        // а не общее «Error loading chatIds»
        message.error(err?.message || 'Error loading chatIds');
      });
  }, []);

  return (
    <AdminLayout>
      <div style={{ padding: 16 }}>
        <h2>List of ChatIds</h2>
        <List
          bordered
          dataSource={chatIds}
          renderItem={(chatId) => (
            <List.Item>
              {/* Ссылка на страницу отчёта по переписке */}
              <Link href={`/admin/tg-logs/report?chatId=${chatId}`}>
                {chatId}
              </Link>
            </List.Item>
          )}
        />
      </div>
    </AdminLayout>
  );
}

export default ChatIdsPage;
