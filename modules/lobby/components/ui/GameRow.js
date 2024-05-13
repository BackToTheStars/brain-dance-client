import { DoubleRightOutlined } from '@ant-design/icons';
import { IntButton as Button } from '@/ui/button';
import { useDispatch } from 'react-redux';
import { SLIDER_MODAL_GAME } from '@/config/lobby/sliderModal';
import { toggleSliderModal } from '../../redux/actions';
import { useRouter } from 'next/navigation';

const GameRow = ({ game, index }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { name, image, status, description, hash } = game;
  const params = { hash }
  return (
    <div className="game-row game-item-row lobby-panel__divider-b s_py-1">
      <div className="circle-cell">
        <span className="circle-cell__text">{index + 1}</span>
      </div>
      <div
        className="game-item game-cell"
        onClick={() => {
          dispatch(
            toggleSliderModal(SLIDER_MODAL_GAME, {
              ...params,
              width: '50%',
            })
          );
        }}
      >
        {name}
        <Button
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            router.push(`/game?hash=${hash}`);
          }}
        >
          <DoubleRightOutlined />
        </Button>
      </div>
    </div>
  );
};

export default GameRow;
