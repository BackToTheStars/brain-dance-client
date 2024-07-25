import { useMainLayoutContext } from "../layout/MainLayoutContext";

const SliderModal = ({ open, closeModal, children }) => {
  const { sliderWidth } = useMainLayoutContext();
  return (
    <div
      className="flex w-full h-full top-0 left-0 absolute duration-500 z-50"
      id="main-sidebar"
      style={{ transform: open ? 'translateX(0%)' : 'translateX(-100%)' }}
    >
      <div
        className={`absolute left-0 top-0 w-full h-full bg-dark bg-opacity-50 transition-all duration-700 delay-150 ${
          open ? 'opacity-[1]' : 'opacity-0'
        }`}
        style={{ filter: `grayscale(1)`, backdropFilter: `blur(1px)` }}
      />
      <div className="w-full relative flex">
        <div
          style={{ left: `${sliderWidth - 32}px` }}
          className="absolute top-[8px] text-xl cursor-pointer text-white z-10"
          onClick={() => {
            closeModal(1000);
          }}
        >
          ✕
        </div>
        {children}
        <div
          className="tmp-close-field"
          onClick={(e) => {
            e.stopPropagation();
            if (e.target === e.currentTarget) {
              closeModal(1000);
            }
          }}
        />
      </div>
    </div>
  );
};

export default SliderModal;
