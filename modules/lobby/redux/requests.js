export const loadTurnsRequest = () => {
  return fetch('https://discourse-prototype.herokuapp.com/turns?hash=373').then(
    (res) => res.json()
  );
};

export const loadTurnsByGameRequest = () => {
  return fetch('http://localhost:3000/lobby/turns?mode=byGame&gameLimit=25&turnLimit=3').then(
    (res) => res.json()
  );
};

export const loadTurnsChronoRequest = () => {
  return fetch('http://localhost:3000/lobby/turns?mode=chrono').then(
    (res) => res.json()
  );
};