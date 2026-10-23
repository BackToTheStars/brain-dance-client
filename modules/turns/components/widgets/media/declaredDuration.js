// Заявленная длительность плеера: первое конечное положительное duration (приходит с метаданными).
// Шкала, цитаты и конец воспроизведения держатся за неё, что бы браузер ни сообщал потом.

export const DURATION_MISMATCH_SECONDS = 1;
// Время после перемотки на конец читается с округлением.
const END_EPSILON = 0.05;

const known = (value) => Number.isFinite(value) && value > 0;

export const nextDeclared = (declared, reported) => {
  if (known(declared)) return declared;
  return known(reported) ? reported : 0;
};

export const durationMismatch = (declared, actual) =>
  known(declared) &&
  Number.isFinite(actual) &&
  Math.abs(actual - declared) > DURATION_MISMATCH_SECONDS;

export const atDeclaredEnd = (time, declared) =>
  known(declared) && Number.isFinite(time) && time >= declared - END_EPSILON;

// Одна загрузка источника: заявленная длительность и не больше одного уведомления о расхождении.
// Уведомление — { declared, actual } или null.
export const createDeclaredDuration = () => {
  let declared = 0;
  let noticed = false;
  const check = (actual) => {
    if (noticed || !durationMismatch(declared, actual)) return null;
    noticed = true;
    return { declared, actual };
  };
  return {
    get declared() {
      return declared;
    },
    // durationchange: пока заявленной нет — принять сообщённое, потом только сверять
    duration(reported) {
      if (!known(declared)) {
        declared = nextDeclared(declared, reported);
        return null;
      }
      return check(reported);
    },
    // позиция на ended раньше заявленного конца — файл короче заголовка (Chrome на ended отдаёт duration)
    ended(position) {
      return check(position);
    },
    reset() {
      declared = 0;
      noticed = false;
    },
  };
};
