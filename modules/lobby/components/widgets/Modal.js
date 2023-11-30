import { CloseCircleOutlined } from '@ant-design/icons';

const Modal = ({ title, children, isOpen = false, onCancel }) => {
  return (
    <div
      className={`bg-dark bg-opacity-70 fixed left-0 top-0 w-screen h-screen flex items-center justify-center z-[100] ${
        isOpen ? 'visible opacity-100' : 'invisible opacity-0'
      }`}
    >
      <div className="max-w-xl w-full h-[450px] flex flex-col border border-white bg-dark rounded overflow-hidden">
        <div className="flex justify-between py-6 px-6">
          <h4 className="text-white text-2xl">{title}</h4>
          <CloseCircleOutlined
            className="cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              onCancel();
            }}
          />
        </div>
        <div className="h-full bg-black p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
