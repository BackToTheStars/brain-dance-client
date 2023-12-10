import Button from '../ui/Button';
import Search from '../ui/Search';
import { VerticalSplit } from '../ui/VerticalSplit';
import { LockOutlined, UnlockOutlined } from '@ant-design/icons';

const GameModal = ({ params }) => {
  const { title, image, status, turns, description, width } = params;
  return (
    <div
      className="flex flex-col h-full dark:bg-dark-light bg-light rounded p-4 relative"
      style={{ width }}
    >
      <VerticalSplit minW={50} maxW={100} element="#main-sidebar" />
      <div className="flex items-center gap-x-4">
        <div className="w-[30px] h-[30px] flex-[0_0_auto] inline-flex items-center justify-center rounded-btn-border border-2 border-main bg-main bg-opacity-10">
          {status === 'public' ? (
            <LockOutlined className="text-[18px] dark:text-light text-dark" />
          ) : (
            <UnlockOutlined className="text-[18px] dark:text-light text-dark" />
          )}
        </div>
        <div className="text-xl font-semibold w-full pe-10 leading-[1.2] dark:text-white text-dark">
          {!!title && title}
        </div>
      </div>
      <div className="mt-4">
        <div className="relative w-full h-[350px]">
          {!!image && (
            <img
              className="w-full h-full object-cover object-center rounded"
              src={`${image}`}
              alt="image"
            />
          )}
          <div className="w-full h-auto flex gap-x-1 absolute bottom-5 left-0 px-3">
            <div className="w-full py-2 text-center bg-main-dark bg-opacity-90 rounded">
              <div className="text-center font-semibold">Номер</div>
              {!!turns && turns}
            </div>
            <div className="w-full py-2 text-center bg-main-dark bg-opacity-90 rounded">
              <div className="text-center font-semibold">Ходы</div>
              {!!turns && turns}
            </div>
            <div className="w-full py-2 text-center bg-main-dark bg-opacity-90 rounded">
              <div className="text-center font-semibold">Просмотры</div>
              {!!turns && turns}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5">
        <Search
          clsInput={'sm:py-[3px] sm:pb-[5px] text-[14px]'}
          showLabel={false}
          clsLabel={'dark:bg-dark-light'}
        />
      </div>
      <div className="mt-6">{!!description && description}</div>
      <div className="mt-auto">
        <Button className={'w-full py-3'} title={'Подробнее'} />
      </div>
    </div>
  );
};

export default GameModal;