'use client';

import { Provider, useDispatch, useSelector } from 'react-redux';
import { useStore } from '../redux/store';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { createContext, useEffect } from 'react';
import {
  setColorSchema,
  setMode,
  setSizeSchema,
} from '@/modules/ui/redux/actions';
import { getBodyClasses } from '@/modules/ui/utils/theme';

import { defaultSchema as defaultColorSchema } from '@/config/ui/color';
import { defaultSchema as defaultSizeSchema } from '@/config/ui/size';
import { defaultMode } from '@/config/ui/mode';

export const CookieContext = createContext();

const ClientInner = ({
  children,
  cookieColorSchema,
  cookieSizeSchema,
  cookieMode,
}) => {
  const dispatch = useDispatch();
  const { colorSchema, sizeSchema, mode } = useSelector(
    (state) => state.ui.themeSettings,
  );

  useEffect(() => {
    document.body.className = getBodyClasses(
      colorSchema || cookieColorSchema,
      sizeSchema || cookieSizeSchema,
      mode || cookieMode,
    );
  }, [colorSchema, sizeSchema, mode]);

  useEffect(() => {
    dispatch(setColorSchema(cookieColorSchema || defaultColorSchema));
    dispatch(setSizeSchema(cookieSizeSchema || defaultSizeSchema));
    dispatch(setMode(cookieMode || defaultMode));
  }, [cookieColorSchema, cookieSizeSchema, cookieMode]);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_REDIRECT_DOMAIN) {
      if (typeof window !== 'undefined') {
        const { pathname, search } = window.location;
        window.location.href = `${process.env.NEXT_PUBLIC_REDIRECT_DOMAIN}${pathname}${search}`;
      }
    }
  }, []);

  return <>{children}</>;
};

const ClientWrapper = ({
  children,
  cookieColorSchema,
  cookieSizeSchema,
  cookieMode,
}) => {
  const store = useStore();

  // E2E-хуки (только при NEXT_PUBLIC_E2E=1, no-op в обычной сборке):
  // 1) доступ к каноническому состоянию Redux для ассертов; 2) ускорение
  // анимаций/переходов почти до нуля, чтобы стабилизировать drag/скриншоты.
  // ВАЖНО: не `animation:none` — antd (rc-motion) дожидается animationend/transitionend,
  // чтобы раскрыть overlay (dropdown/modal/tooltip); полное отключение оставляет их
  // скрытыми. Делаем длительности ~0, события при этом срабатывают.
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_E2E !== '1') return;
    if (typeof window === 'undefined') return;
    window.__APP_STATE__ = () => store.getState();
    window.__STORE__ = store;
    const style = document.createElement('style');
    style.setAttribute('data-e2e', '');
    style.textContent =
      '*,*::before,*::after{transition-duration:0.001ms!important;transition-delay:0ms!important;animation-duration:0.001ms!important;animation-delay:0ms!important;scroll-behavior:auto!important}';
    document.head.appendChild(style);
    return () => style.remove();
  }, [store]);

  const bodyClassNames = getBodyClasses(
    cookieColorSchema,
    cookieSizeSchema,
    cookieMode,
  );
  return (
    <CookieContext.Provider
      value={{ cookieColorSchema, cookieSizeSchema, cookieMode }}
    >
      <Provider store={store}>
        <AntdRegistry>
          <body className={bodyClassNames}>
            <ClientInner
              cookieColorSchema={cookieColorSchema}
              cookieSizeSchema={cookieSizeSchema}
              cookieMode={cookieMode}
            >
              {children}
            </ClientInner>
          </body>
        </AntdRegistry>
      </Provider>
    </CookieContext.Provider>
  );
};

export default ClientWrapper;
