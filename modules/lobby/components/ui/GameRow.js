import {
  DoubleRightOutlined,
  PushpinFilled,
  PushpinOutlined,
} from '@ant-design/icons';
import { IntButton as Button } from '@/ui/button';
import { useDispatch } from 'react-redux';
import { SLIDER_MODAL_GAME } from '@/config/lobby/sliderModal';
import { toggleSliderModal } from '../../redux/actions';
import { useRouter } from 'next/navigation';
import {
  addGame,
  pinFirstCode,
  unpinAllCodes,
} from '@/modules/settings/redux/actions';
import { ROLES, ROLE_GAME_VISITOR } from '@/config/user';

const GameRow = ({ game, index, settings = {} }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { name, image, status, description, hash } = game;
  const params = { hash };
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
            }),
          );
        }}
      >
        {name}
        <div className="flex gap-2">
          {settings.isPinned ? (
            <Button
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                dispatch(unpinAllCodes(game.hash));
              }}
            >
              <PushpinFilled />
            </Button>
          ) : (
            <Button
              className="hover-show"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!settings?.codes?.length) {
                  dispatch(
                    addGame({
                      hash: game.hash,
                      nickname: ROLES[ROLE_GAME_VISITOR].name,
                      role: ROLE_GAME_VISITOR,
                      code: game.hash,
                    }),
                  );
                  setTimeout(() => {
                    dispatch(pinFirstCode(game.hash));
                  }, 1000);
                } else {
                  dispatch(pinFirstCode(game.hash));
                }
              }}
            >
              <PushpinOutlined />
            </Button>
          )}
          <Button
            className="hover-show"
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
    </div>
  );
};

export default GameRow;
