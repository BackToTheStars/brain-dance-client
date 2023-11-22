import CloseIcon from '/public/icons/close.svg';

const Modal = ({ title, children }) => {
  return (
    <div className="bg-dark bg-opacity-70 fixed left-0 top-0 w-screen h-screen flex items-center justify-center">
      <div className="max-w-xl w-full h-[450px] flex flex-col border border-white bg-dark rounded overflow-hidden">
        <div className="flex justify-between py-6 px-6">
          <h4 className="text-white text-2xl">{title}</h4>
          <CloseIcon className="path-color w-[25px] h-auto" path="red" />
        </div>
        <div className="h-full bg-black p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
