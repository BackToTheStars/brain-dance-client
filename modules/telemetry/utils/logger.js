const d = {}; // инкременты
const timers = {}; // таймеры

const s = { d, timers };

export const increment = (type, payload) => {
  const info = d[type] || { count: 0 };
  info.count += 1;
  d[type] = info;
};

export const showLoggerStats = () => {
  console.log(s);
};

if (typeof window !== 'undefined') {
  window.showLoggerStats = showLoggerStats;
}

// {
//   dsaf: {items: [], start: '', end: '', delta: ''}
// }

export const startLoggingTime = (type) => {
  if (!timers[type]) timers[type] = { items: [] };
  timers[type].items.push(Date.now());
};

export const stopLoggingTime = (type) => {
  const time = Date.now();
  if (!timers[type]) {
    timers[type] = { items: [time], start: time, end: time, delta: 0 };
    return;
  }
  timers[type].items.push(time);
  timers[type].start = timers[type].items[0];
  timers[type].end = time;
  timers[type].delta = (timers[type].end - timers[type].start) / 1000;
};
