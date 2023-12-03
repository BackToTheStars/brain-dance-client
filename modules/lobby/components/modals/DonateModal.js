import Button from '../ui/Button';

const DonateModal = () => {
  return (
    <div className="w-full h-full bg-black">
      <form action="#" className="h-full">
        <div className="w-full my-3 flex flex-col h-full">
          <div className="relative">
            <label className="absolute left-[32px] text-xl top-[-16px] bg-black px-3 text-main-text">
              Введите сумму пожертвования
            </label>
            <input
              className="border-2 border-main px-6 py-4 rounded-full outline-none bg-transparent w-full"
              type="number"
              placeholder="0"
            />
          </div>
          <Button title={'Пожертвовать'} className={'w-full mt-auto mb-4'} />
        </div>
      </form>
    </div>
  );
};

export default DonateModal;
