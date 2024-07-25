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

  return <>{children}</>;
};

const ClientWrapper = ({
  children,
  cookieColorSchema,
  cookieSizeSchema,
  cookieMode,
}) => {
  const store = useStore();
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
