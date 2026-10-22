import { MdForward10, MdReplay10 } from 'react-icons/md';
import { SKIP_SECONDS, skipTarget } from './skip';

const SkipButtons = ({ progress, duration, seek, disabled, className, backId, forwardId }) => {
  const off = disabled || !(duration > 0);
  const jump = (delta) => seek(skipTarget(progress, delta, duration));
  return (
    <>
      <button
        type="button"
        className={className}
        data-test-id={backId}
        disabled={off}
        title={`Back ${SKIP_SECONDS} s`}
        aria-label={`Back ${SKIP_SECONDS} s`}
        onClick={() => jump(-SKIP_SECONDS)}
      >
        <MdReplay10 />
      </button>
      <button
        type="button"
        className={className}
        data-test-id={forwardId}
        disabled={off}
        title={`Forward ${SKIP_SECONDS} s`}
        aria-label={`Forward ${SKIP_SECONDS} s`}
        onClick={() => jump(SKIP_SECONDS)}
      >
        <MdForward10 />
      </button>
    </>
  );
};

export default SkipButtons;
