import { moveField } from '@/modules/turns/redux/actions';

export const utils = {
  moveScene: () => {},
};

export const registerMoveScene = (dispatch, gameBoxEl) => {
  utils.moveScene = (left, top, animationTime = 0) => {
    $(gameBoxEl).addClass('remove-line-transition');
    $(gameBoxEl).animate(
      {
        left: `${left}px`,
        top: `${-top}px`,
      },
      animationTime,
      () => {
        dispatch(
          moveField({
            left: -left,
            top: top,
          })
        );
        $(gameBoxEl).css('left', 0);
        $(gameBoxEl).css('top', 0);
        setTimeout(() => {
          $(gameBoxEl).removeClass('remove-line-transition');
        }, 100);
      }
    );
  };
};
