import { getStore, lsUpdateLayoutSettings } from '@/modules/settings/redux/requests';
import { createContext, useContext, useEffect, useState } from 'react';
import Loading from '@/modules/ui/components/common/Loading';

const MainLayoutContext = createContext();

export const MainLayoutProvider = ({ children }) => {
  const [leftSideWidth, setLeftSideWidth] = useState(null);
  const [sliderWidth, setSliderWidth] = useState(465);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Только свои ключи, и только если они есть: в layoutSettings лежат и ключи
    // панели редактора хода (editorPanelWidth, editorFontSize), и «объект не
    // пуст» больше не значит «лобби уже сохраняло ширины» — иначе sliderWidth
    // становился undefined, и слайдер игры открывался на максимуме вместо 465.
    const layoutSettings = getStore().layoutSettings || {};
    if (layoutSettings.leftSideWidth) {
      setLeftSideWidth(layoutSettings.leftSideWidth);
    }
    if (layoutSettings.sliderWidth) {
      setSliderWidth(layoutSettings.sliderWidth);
    }
    setTimeout(() => {
      setIsReady(true);
    }, 100);
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
