import { Spin } from 'antd';
import { useTranslations } from 'next-intl';

const Loading = () => {
  const t = useTranslations("UI");
  return (
    <div className="w-full h-full flex items-center justify-center gap-2 p-4">
      <Spin size="large" /> {t("Loading")}
    </div>
  );
};

export default Loading;
