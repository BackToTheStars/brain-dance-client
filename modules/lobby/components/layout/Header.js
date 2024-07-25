'use client';
import { useEffect, useMemo, useState } from 'react';

import { IntButton as Button } from '@/ui/button';
import { useDispatch, useSelector } from 'react-redux';
import { openModal } from '@/modules/ui/redux/actions';
import {
  MODAL_CREATE_GAME,
  MODAL_DONATE,
  MODAL_ENTER_GAME,
} from '@/config/lobby/modal';
import { TogglerPanel, TogglerWrapper } from '../ui/Toggler';
import ContentSettings from '../elements/ContentSettings';
import ColumnsSlider from '../controls/ColumnsSlider';
import TurnListControls from '../controls/TurnListControls';
import { useTranslations } from 'next-intl';
import { useMainLayoutContext } from './MainLayoutContext';
import {
  getStore,
  lsUpdateTextSettings,
} from '@/modules/settings/redux/requests';
import { loadTextSettings } from '../../redux/actions';
const SettingsLoader = () => {
  const textSettings = useSelector((s) => s.lobby.textSettings);
  const dispatch = useDispatch();
  const [isReady, setIsReady] = useState(false);
    useEffect(() => {
      const textSettings = getStore().textSettings;
      if (textSettings && Object.keys(textSettings).length) {
        dispatch(loadTextSettings(textSettings));
      }
      setTimeout(() => setIsReady(true), 1000);
    }, []);

    useEffect(() => {
      if (!isReady) return;
      lsUpdateTextSettings(textSettings);
    }, [isReady, textSettings]);

    return null;
}

const Header = () => {
  const t = useTranslations('Lobby');
  const dispatch = useDispatch();
  const { leftSideWidth } = useMainLayoutContext();

  const leftSideStyle = useMemo(() => {
    return {
      width: leftSideWidth ? `${leftSideWidth + 16}px` : 'calc(50% + 16px)',
    };
  }, [leftSideWidth]);
  return (
    <header className="lobby-block pt-4 flex justify-between z-10">
      <div
        style={leftSideStyle}
        className="lobby-block flex gap-2 divider-r pb-2"
      >
        <Button size="sm" onClick={() => dispatch(openModal(MODAL_ENTER_GAME))}>
          {t('Enter_game')}
        </Button>
        <Button
          size="sm"
          onClick={() => dispatch(openModal(MODAL_CREATE_GAME))}
        >
          {t('Create_game')}
        </Button>
      </div>
      <div className="lobby-block flex gap-2 flex-1 justify-between pl-4 pb-2">
        <SettingsLoader />
        <TogglerWrapper
          Button={({ toggle, className = '' }) => (
            <Button onClick={toggle} size="sm" className={className}>
              {t('Settings')}
            </Button>
          )}
          Panel={
            <TogglerPanel>
              <div className="base-card w-[350px]">
                <div className="base-card__body p-2">
                  <ContentSettings />
                </div>
              </div>
            </TogglerPanel>
          }
        />
        <TogglerWrapper
          Button={({ toggle, className = '' }) => (
            <Button onClick={toggle} size="sm" className={className}>
              {t('Parameters')}
            </Button>
          )}
          Panel={
            <TogglerPanel style={{ transform: `translateX(-95px)` }}>
              <div className="base-card w-[350px]">
                <div className="base-card__body p-2">
                  <TurnListControls />
                </div>
              </div>
            </TogglerPanel>
          }
        />
        <ColumnsSlider />
        <div className="flex-1" />
        <Button size="sm" onClick={() => dispatch(openModal(MODAL_DONATE))}>
          {t('Donate')}
        </Button>
      </div>
    </header>
  );
};

export default Header;
