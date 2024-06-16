import { cookies } from 'next/headers';
import 'jquery-ui/themes/base/all.css';
import 'react-image-crop/dist/ReactCrop.css';
import ClientWrapper from './ClientWrapper';
import '@/themes/game/index.scss';
import '@/themes/index.scss';
import { getLocale } from 'next-intl/server';
import IntlProvider from './IntlProvider';

export default async function RootLayout({ children }) {
  const cookieStore = cookies();
  const cookieColorSchema = cookieStore.get('colorSchema')?.value;
  const cookieSizeSchema = cookieStore.get('sizeSchema')?.value;
  const cookieMode = cookieStore.get('mode')?.value;
  const locale = await getLocale();

  return (
    <html lang={locale} className="dark">
      <head>
        <script src="/js/jquery.js"></script>
        <script src="/js/jquery-ui/jquery-ui.min.js"></script>
        {/* <script src="/quill/quill.min.js"></script> */}
        <link rel="stylesheet" href="/quill/quill.snow.css" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css"
        />
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
