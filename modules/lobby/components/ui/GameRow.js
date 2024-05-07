import { DoubleRightOutlined } from '@ant-design/icons';
import { IntButton as Button } from '@/ui/button';

const GameRow = ({ game, index }) => {
  const { name, image, status, turns, description, hash } = game;
  return (
    <div className="game-row game-item-row lobby-panel__divider-b s_py-1">
      <div className="circle-cell">
        <span className="circle-cell__text">{index + 1}</span>
      </div>
      <div
        className="game-item game-cell"
        onClick={() => {
          // dispatch(
          //   openSliderModal(SLIDER_MODAL_GAME, {
          //     ...params,
          //     width: '50%',
          //   })
          // );
        }}
      >
        {name}
        <Button
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            // router.push(`/game?hash=${hash}`);
          }}
        >
          <DoubleRightOutlined />
        </Button>
      </div>
    </div>
  );
};

export default GameRow;
