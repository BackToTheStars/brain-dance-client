export const getQueue = (delay = 50) => {
  let timeoutId = null;
  let lastTime = 0;
  const MIN_INTERVAL_GAP = 30;
  let inc = 0;
  return {
    add: (callback) => {
      let newInc = (inc += 1);
      console.log({ inc });
      // 20 изменений в секунду
      const currentTime = new Date().getTime();
      const deltaTime = Math.max(currentTime - lastTime, MIN_INTERVAL_GAP);
      clearTimeout(timeoutId);
      // если delay уже прошёл, вызываем функцию сразу
      console.log({
        deltaTime,
        delay,
      });
      if (deltaTime >= delay) {
        lastTime = currentTime;
        callback();
        console.log('Вызываем сразу');
        return;
      }
      // пропускаем промежуточные вызовы
      timeoutId = setTimeout(() => {
        lastTime = new Date().getTime();
        console.log('Отложенный вызов');
        callback();
        console.log({ newInc });
      }, deltaTime);
    },
    clear: () => clearTimeout(timeoutId),
  };
};
