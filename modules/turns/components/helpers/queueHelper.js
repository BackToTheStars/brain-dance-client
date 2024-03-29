export const getQueue = (delay = 50) => {
  let timeoutId = null;
  let lastTime = 0;
  const MIN_INTERVAL_GAP = 30;
  let inc = 0;
  return {
    add: (callback) => {
      let newInc = (inc += 1);
      // 20 изменений в секунду
      const currentTime = new Date().getTime();
      const deltaTime = Math.max(currentTime - lastTime, MIN_INTERVAL_GAP);
      clearTimeout(timeoutId);
      // если delay уже прошёл, вызываем функцию сразу
      if (deltaTime >= delay) {
        lastTime = currentTime;
        callback();
        return;
      }
      // пропускаем промежуточные вызовы
      timeoutId = setTimeout(() => {
        lastTime = new Date().getTime();
        callback();
      }, deltaTime);
    },
    clear: () => clearTimeout(timeoutId),
  };
};
