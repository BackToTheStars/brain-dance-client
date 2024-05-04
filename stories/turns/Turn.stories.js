import { fn } from '@storybook/test';
import Turn from '@/modules/turns/components/Turn';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import {
  TURNS_LOAD_DATA,
  TURNS_LOAD_GEOMETRY,
} from '@/modules/turns/redux/types';
import { GRID_CELL_X } from '@/config/ui';
import {
  defaultMockTurn,
  getDefaultMockTurnWithArgs,
} from '@/modules/mock/helpers/turns';

export default {
  title: 'Turn',
  component: Turn,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen',
  },
  argTypes: {
    background: { control: 'color' },
    font: { control: 'color' },
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {
    onClick: fn(),
    showHeader: true,
    showImage: false,
    showVideo: false,
    pictureOnly: false,
    width: 400,
    height: 300,
    contentType: 'comment',
    background: '#eced9a',
    font: '#0a0a0a',
  },
};

export const Default = {
  decorators: [
    (Story, { args }) => {
      const dispatch = useDispatch();
      const turnGeometry = useSelector(
        (state) => state.turns.g[defaultMockTurn._id],
      );
      useEffect(() => {
        const mockTurn = getDefaultMockTurnWithArgs(args);
        dispatch({
          type: TURNS_LOAD_GEOMETRY,
          payload: {
            turns: [mockTurn],
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
            turns: [mockTurn],
          },
        });
      }, [args]);
      return (
        <div className="stb-turns-container">
          {!!turnGeometry && <Turn id={defaultMockTurn._id} />}
        </div>
      );
    },
  ],
};
