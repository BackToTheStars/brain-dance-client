// components/StartDateFilter.js
import { DatePicker, Space, Button } from 'antd';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'; // Для работы с UTC

// Подключаем плагин для работы с UTC
dayjs.extend(utc);

const { RangePicker } = DatePicker;

const StartDateFilter = ({ startDate, endDate, onChange, onReset }) => {
  // Преобразуем даты из UTC в локальное время
  const localStartDate = startDate ? dayjs.utc(startDate).local() : null;
  const localEndDate = endDate ? dayjs.utc(endDate).local() : null;

  return (
    <Space>
      <RangePicker
        value={[localStartDate, localEndDate]} // Используем value для управления состоянием
        onChange={(dates) => {
          if (dates) {
            const [start, end] = dates;
            // Преобразуем даты обратно в UTC перед отправкой на бэкенд
            const utcStart = start.utc().toISOString();
            const utcEnd = end.utc().toISOString();
            onChange(utcStart, utcEnd);
          } else {
            onReset(); // Сброс фильтра
          }
        }}
        showTime={{ format: 'HH:mm' }}
        format="YYYY-MM-DD HH:mm"
        placeholder={['Начальная дата', 'Конечная дата']}
      />
      <Button onClick={onReset}>Сбросить</Button>
    </Space>
  );
};

export default StartDateFilter;