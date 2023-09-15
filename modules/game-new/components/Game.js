import { loadFullGame } from '@/modules/game/game-redux/actions';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReactFlow, { MiniMap, Controls } from 'reactflow';

import 'reactflow/dist/style.css';

// import { memo } from 'react';
import { Handle, Position, NodeResizer } from 'reactflow';
// import Turn from '@/modules/turns/components/Turn';
import TurnNew from './Turn';

const ResizableNode = ({ id, data }) => {
  return (
    <>
      <NodeResizer minWidth={100} minHeight={30} />
      <Handle type="target" position={Position.Left} />
      <TurnNew key={id} id={id} />
      {/* <div
        style={{
          padding: 10,
          // width: data.size.width + 'px',
          // height: data.size.height + 'px',
          backgroundColor: "#eee"
        }}
      >
        {data.label}
      </div> */}
      <Handle type="source" position={Position.Right} />
    </>
  );
};

// const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

const nodeTypes = {
  ResizableNode,
};

const GameNew = ({ hash }) => {
  const dispatch = useDispatch();
  const turns = useSelector((s) => s.turns.turns);
  const initialNodes = [
    // { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
    // { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
    ...turns.map((t) => ({
      id: t._id,
      position: t.position,
      // size: t.size,
      type: 'ResizableNode',
      data: {
        ...t,
        label: t.dWidgets?.h_1?.text || 'default',
      },
      style: {
        ...t.size,
        backgroundColor: '#fff',
      },
    })),
  ];
  useEffect(() => {
    dispatch(loadFullGame(hash));
  }, []);

  if (!turns.length) {
    return null;
  }
  return (
    <div>
      <div style={{ width: '100vw', height: '100vh' }}>
        <ReactFlow
          defaultNodes={initialNodes}
          // edges={initialEdges}
          nodeTypes={nodeTypes}
        >
          <MiniMap />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
};

export default GameNew;
