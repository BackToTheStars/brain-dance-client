import { useState } from 'react';

export const useDebug = () => {
  //
  const [debugLines, setDebugLines] = useState([
    { x1: 30, y1: 30, x2: 30, y2: 150, color: 'green' },
  ]);

  const addDebugLine = ({ x1, y1, x2, y2, color = 'green' }) => {
    const newLine = { x1, y1, x2, y2, color };
    setDebugLines([...debugLines, newLine]);
  };

  const updateDebugLines = (lines) => {
    setDebugLines(lines);
  };

  return { debugLines, addDebugLine, updateDebugLines };
};
