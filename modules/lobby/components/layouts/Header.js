import { useDispatch } from 'react-redux';
import Button from '../ui/Button';
// import SwitchTheme from '../ui/SwitchTheme';
import { openModal } from '../../redux/actions';
import { DollarOutlined } from '@ant-design/icons';
import {
  MODAL_CREATE_GAME,
  MODAL_DONATE,
  MODAL_ENTER_GAME,
} from '@/config/lobby/modal';
import { ContentToolbar } from './RightContent';
import Link from 'next/link';

const Header = () => {
  const dispatch = useDispatch();
  return (
    <header className="sm:h-[50px]">
      <div className="flex sm:gap-6 gap-4 sm:flex-nowrap flex-wrap h-full items-center">
        <div className="sm:order-2 order-1 flex sm:gap-x-6 gap-x-4 sm:flex-[0_0_100%] sm:w-auto w-full">
          <div className="flex flex-1 items-center sm:gap-x-6 gap-x-4">
            <Button
              onClick={(e) => {
                e.preventDefault();
                dispatch(openModal(MODAL_ENTER_GAME));
              }}
              title={'Войти в игру'}
              className={'sm:flex-[0_0_auto] h-[32px] pb-3 sm:w-auto w-full'}
            />
            <Button
              onClick={(e) => {
                e.preventDefault();
                dispatch(openModal(MODAL_CREATE_GAME));
              }}
              title={'Создать игру'}
              className={'sm:flex-[0_0_auto] h-[32px] pb-3 sm:w-auto w-full'}
            />
            {/* <Link href="/lobby-old">Lobby Old</Link> */}
          </div>
          {/* @todo: remove pl */}
          <div className="flex flex-1 sm:gap-x-6 gap-x-4 items-center pl-16 pr-3">
            <ContentToolbar />
            <Button
              link={'#'}
              title={<DollarOutlined className="text-[18px]" />}
              onClick={(e) => {
                e.preventDefault();
                dispatch(openModal(MODAL_DONATE));
              }}
              className={
                'sm:flex-[0_0_36px] sm:h-[30px] py-2 lg:px-0 px-0 sm:w-auto w-full dark:text-white text-dark-light text-opacity-80 inline-block'
              }
            />
          </div>
          {/* <SwitchTheme /> */}
        </div>
      </div>
    </header>
  );
};

export default Header;
