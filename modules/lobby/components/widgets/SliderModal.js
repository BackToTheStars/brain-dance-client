const SliderModal = ({ open, closeModal, children }) => {
  return (
    <div
      className="flex w-full h-full top-0 left-0 absolute transition-all z-50"
      id="main-sidebar"
      style={{ transform: open ? 'translateX(0%)' : 'translateX(-100%)' }}
    >
      <div
        className={`absolute left-0 top-0 w-full h-full bg-dark bg-opacity-50 transition-all duration-700 delay-150 ${
          open ? 'opacity-[1]' : 'opacity-0'
        }`}
        style={{ filter: `grayscale(1)`, backdropFilter: `blur(1px)` }}
      ></div>
      <div className="w-full relative">
        <div
          className="absolute right-[12px] top-[8px] text-xl cursor-pointer text-white"
          onClick={() => {
            closeModal();
          }}
        >
          ✕
        </div>
        <div className="w-full h-full">{children}</div>
      </div>
    </div>
  );
};

export default SliderModal;
