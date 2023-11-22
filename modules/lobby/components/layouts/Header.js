import Button from '../ui/Button';
import SwitchTheme from '../ui/SwitchTheme';

const Header = () => {
  return (
    <header className="sm:h-[60px]">
      <div className="flex sm:gap-6 gap-4 sm:flex-nowrap flex-wrap">
        <div className="sm:order-2 order-1 flex sm:gap-x-6 gap-x-4 sm:flex-[0_0_100%] sm:w-auto w-full">
          <Button
            link={'#'}
            title={'Войти в игру'}
            className={'sm:flex-[0_0_auto] sm:h-[60px] sm:w-auto w-full'}
          />
          <Button
            link={'#'}
            title={'Создать игру'}
            className={'sm:flex-[0_0_auto] sm:h-[60px] sm:w-auto w-full'}
          />
          <Button
            link={'#'}
            title={'$'}
            className={
              'sm:flex-[0_0_60px] sm:h-[60px] py-2 lg:px-3 px-3 sm:w-auto w-full dark:text-white text-dark-light text-opacity-80 inline-block ms-auto text-[35px]'
            }
          />
          <SwitchTheme />
        </div>
      </div>
    </header>
  );
};

export default Header;
