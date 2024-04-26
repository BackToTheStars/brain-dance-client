import { enterGameRequest } from '@/modules/admin/requests';
import Modal from '@/modules/ui/components/Modal';
import { useRouter } from 'next/navigation';

const EnterGameModal = ({ close, onCreate }) => {
  const router = useRouter();
  const enterGame = (hash, nickname) => {
    router.push(`/code?hash=${hash}&nickname=${nickname}`);
  };

  return (
    <Modal title="Enter Game" close={close}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          enterGame(e.target.code.value, e.target.nickname.value);
        }}
      >
        <div className="row">
          <div>
            <input
              className="form-control modal-field"
              name="code"
              type="text"
              placeholder="Enter code"
              required
            />
          </div>

          <div>
            <input
              className="form-control modal-field"
              name="nickname"
              type="text"
              placeholder="Enter nickname"
              required
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn cancel" onClick={close}>
              Cancel
            </button>
            <button type="submit" className="btn enter-btn">
              Enter Game
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default EnterGameModal;
