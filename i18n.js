import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { defaultLanguage, defaultTimeZone } from './config/settings/language';

export default getRequestConfig(async () => {
  const cookieStore = cookies();
  const locale = cookieStore.get('language')?.value || defaultLanguage;
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
    timeZone: defaultTimeZone,
  };
});
