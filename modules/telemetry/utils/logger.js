const d = {};

export const increment = (type, payload) => {
  const info = d[type] || { count: 0 };
  info.count += 1;
  d[type] = info;
};

export const showLoggerStats = () => {
  console.log(d);
};

if (typeof window !== 'undefined') {
  window.showLoggerStats = showLoggerStats;
}
