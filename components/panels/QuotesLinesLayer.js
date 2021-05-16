import { useTurnContext } from '../contexts/TurnContext';

const QuotesLinesLayer = () => {
  const viewportHeight = window ? window.innerHeight : 1600;
  const viewportWidth = window ? window.innerWidth : 1200; // @todo сделать импорт из UI Context
  const { linesState } = useTurnContext();
  const { lines } = linesState;
  console.log(lines);

  return (
    <>
      <svg
        viewBox={`0 0 ${viewportWidth} ${viewportHeight}`}
        xmlns="http://www.w3.org/2000/svg"
        id="lines"
        class="front-elements"
      ></svg>
    </>
  );
};

export default QuotesLinesLayer;
