'use client';
import { defaultLanguage, defaultTimeZone } from '@/config/settings/language';
import { changeLanguage } from '@/modules/settings/redux/lang/languageSlice';
import { NextIntlClientProvider } from 'next-intl';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function IntlProvider({ ssrLocale, children }) {
  const dispatch = useDispatch();
  const language = useSelector((state) => state.lang.language);
  const locale = language || ssrLocale || defaultLanguage;

  useEffect(() => {
    if (!language && locale) {
      dispatch(changeLanguage(locale));
    }
  }, [language, locale]);
  return (
    <NextIntlClientProvider
      locale={locale}
      timeZone={defaultTimeZone}
      messages={require(`../messages/${locale}.json`)}
    >
      {children}
    </NextIntlClientProvider>
  );
}
