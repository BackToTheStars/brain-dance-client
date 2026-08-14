import { cookies } from 'next/headers';
import 'react-image-crop/dist/ReactCrop.css';
import 'quill/dist/quill.snow.css';
import ClientWrapper from './ClientWrapper';
import '@/themes/game/index.scss';
import '@/themes/tailwind.css';
import '@/themes/index.scss';
import { getLocale } from 'next-intl/server';
import IntlProvider from './IntlProvider';

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const cookieColorSchema = cookieStore.get('colorSchema')?.value;
  const cookieSizeSchema = cookieStore.get('sizeSchema')?.value;
  const cookieMode = cookieStore.get('mode')?.value;
  const locale = await getLocale();

  return (
    <html lang={locale} className="dark">
      <head>
        <script src="/js/jquery.js"></script>
        <script src="/js/jquery-ui/jquery-ui.min.js"></script>
        <link rel="stylesheet" href="/js/jquery-ui/jquery-ui.min.css" />
        {/* font-awesome 5.15.1 лежит локально (public/fontawesome) — внешних CDN нет */}
        <link rel="stylesheet" href="/fontawesome/css/all.min.css" />
        <link rel="icon" type="image/png" href="/favicon.png"/>
      </head>
      <ClientWrapper
        cookieColorSchema={cookieColorSchema}
        cookieSizeSchema={cookieSizeSchema}
        cookieMode={cookieMode}
      >
        <IntlProvider ssrLocale={locale}>{children}</IntlProvider>
      </ClientWrapper>
    </html>
  );
}

export const metadata = {
  title: 'Brain Dance',
  description: 'Discourse',
};
