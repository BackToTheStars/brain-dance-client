import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RULE_TURNS_CRUD } from '@/config/user';
import {
  loadAutoSaveField,
  saveField,
} from '@/modules/game/game-redux/actions';
import { selectFollowing } from '@/modules/presence/redux/selectors';
import { addNotification } from '@/modules/ui/redux/actions';
import { useUserContext } from '@/modules/user/contexts/UserContext';
import { selectUnsavedSignature } from '../redux/selectors';

// Auto Save Field: тихий Save Field через паузу после последней правки ходов.
// Спутнику экскурсии и роли без права править ходы — никогда.
const AutoSaveField = () => {
  const dispatch = useDispatch();
  const { can } = useUserContext();
  const following = useSelector(selectFollowing);
  const { enabled, delay } = useSelector((state) => state.game.autoSave);
  const active = enabled && can(RULE_TURNS_CRUD) && !following;
  const unsaved = useSelector((state) =>
    active ? selectUnsavedSignature(state) : '',
  );
  const pointerDown = useRef(false);
  const saving = useRef(false);
  const failed = useRef(false);

  useEffect(() => {
    dispatch(loadAutoSaveField());
  }, []);

  // Перетаскивание и изменение размера пишут геометрию по ходу движения: пока
  // кнопка нажата, запись ждёт.
  useEffect(() => {
    const down = () => (pointerDown.current = true);
    const up = () => (pointerDown.current = false);
    window.addEventListener('pointerdown', down, true);
    window.addEventListener('pointerup', up, true);
    window.addEventListener('pointercancel', up, true);
    window.addEventListener('blur', up);
    return () => {
      window.removeEventListener('pointerdown', down, true);
      window.removeEventListener('pointerup', up, true);
      window.removeEventListener('pointercancel', up, true);
      window.removeEventListener('blur', up);
    };
  }, []);

  // Отказ сервера не повторяется сам: следующая попытка — со следующей правкой,
  // сообщение — одно на серию отказов (серия кончается, когда сохранять нечего).
  useEffect(() => {
    if (!unsaved) failed.current = false;
    if (!active || !unsaved) return;
    let timer;
    const fire = () => {
      if (pointerDown.current || saving.current) {
        timer = setTimeout(fire, delay);
        return;
      }
      saving.current = true;
      dispatch(saveField({ silent: true }))
        .then(
          () => {
            failed.current = false;
          },
          (error) => {
            if (!failed.current) {
              dispatch(
                addNotification({
                  title: 'Error:',
                  text: `Auto Save Field failed: ${error?.message || error}`,
                }),
              );
            }
            failed.current = true;
          },
        )
        .finally(() => {
          saving.current = false;
        });
    };
    timer = setTimeout(fire, delay);
    return () => clearTimeout(timer);
  }, [active, unsaved, delay]);

  return null;
};

export default AutoSaveField;
