import { fn } from '@storybook/test';
import Turn from '@/modules/turns/components/Turn';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import {
  TURNS_LOAD_DATA,
  TURNS_LOAD_GEOMETRY,
} from '@/modules/turns/redux/types';
import { GRID_CELL_X } from '@/config/ui';
import { defaultMockTurn } from '@/modules/mock/helpers/turns';

export default {
  title: 'Turn',
  component: Turn,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen',
  },
  args: {
    turn: {
      _id: '1',
      position: {
        x: 0,
        y: 0,
      },
      size: {
        width: 800,
        height: 600,
      },
    },
  },
  argTypes: {
    // backgroundColor: { control: 'color' },
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: { onClick: fn() },
};

export const Default = {
  decorators: [
    () => {
      const dispatch = useDispatch();
      const turnGeometry = useSelector((state) => state.turns.g[defaultMockTurn._id]);
      useEffect(() => {
        dispatch({
          type: TURNS_LOAD_GEOMETRY,
          payload: {
            turns: [defaultMockTurn],
            viewport: {
              position: {
                x: 0,
                y: 0,
              },
              size: {
                width: 1200,
                height: 800,
              },
            },
          },
        });
        dispatch({
          type: TURNS_LOAD_DATA,
          payload: {
            turns: [defaultMockTurn],
          },
        });
      }, []);
      return (
        <div className="turns-container" style={{ position: 'relative' }}>
          {!!turnGeometry && <Turn id={defaultMockTurn._id} />}
        </div>
      );
    },
  ],
};
