import { getStore, lsUpdateLayoutSettings } from '@/modules/settings/redux/requests';
import { createContext, useContext, useEffect, useState } from 'react';
import Loading from '@/modules/ui/components/common/Loading';

const MainLayoutContext = createContext();

export const MainLayoutProvider = ({ children }) => {
  const [leftSideWidth, setLeftSideWidth] = useState(null);
  const [sliderWidth, setSliderWidth] = useState(465);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Только свои ключи: рядом лежат ключи панели редактора, и «объект не пуст» больше
    // не значит «лобби сохраняло ширины» — иначе sliderWidth становился undefined.
    const layoutSettings = getStore().layoutSettings || {};
    if (layoutSettings.leftSideWidth) {
      setLeftSideWidth(layoutSettings.leftSideWidth);
    }
    if (layoutSettings.sliderWidth) {
      setSliderWidth(layoutSettings.sliderWidth);
    }
    // getStore() читает localStorage синхронно — ждать таймером нечего.
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    lsUpdateLayoutSettings({
      leftSideWidth,
      sliderWidth,
    });
  }, [leftSideWidth, sliderWidth, isReady]);

  return (
    <MainLayoutContext.Provider value={{
      leftSideWidth,
      setLeftSideWidth,
      sliderWidth,
      setSliderWidth,
    }}>
      {isReady ? children : <Loading />}
    </MainLayoutContext.Provider>
  );
};

export const useMainLayoutContext = () => useContext(MainLayoutContext);
