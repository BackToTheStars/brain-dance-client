import { Spin } from 'antd';

const Loading = () => {
  return (
    <div className="w-full h-full flex items-center justify-center gap-2 p-4">
      <Spin size="large" /> Loading...
    </div>
  );
};

export default Loading;
