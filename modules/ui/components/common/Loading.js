'use client';

import { Spin } from 'antd';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

// Задержка появления: загрузка, уложившаяся в неё, проходит вообще без спиннера.
// Таймер стартует после гидратации, поэтому в SSR-разметке лоадера нет вовсе.
// delay={0} — показать сразу.
const LOADER_DELAY = 150;

const Loading = ({ delay = LOADER_DELAY }) => {
  const t = useTranslations("UI");
  const [shown, setShown] = useState(!delay);

  useEffect(() => {
    if (!delay) return;
    const timer = setTimeout(() => setShown(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className="w-full h-full flex items-center justify-center gap-2 p-4">
      {shown && (
        <>
          <Spin size="large" /> {t("Loading")}
        </>
      )}
    </div>
  );
};

export default Loading;
