'use client';

import 'jquery-ui/themes/base/all.css';
import '@/theme/scss/index.scss';
import '../themes/lobby/index.scss';
import { Provider } from 'react-redux';
import { useStore } from '../redux/store';
import { Inter, Nova_Square } from 'next/font/google';

const nova = Nova_Square({
  variable: '--additional-font',
  weight: ['400'],
  subsets: ['latin'],
});

const inter = Inter({
  variable: '--main-font',
  weight: ['400', '700'],
  subsets: ['latin'],
});

export default function RootLayout({ children }) {
  const store = useStore();
  return (
    <html lang="ru">
      <head>
        <script src="/js/jquery.js"></script>
        <script src="/js/jquery-ui/jquery-ui.min.js"></script>
        {/* <script src="/quill/quill.min.js"></script> */}
        <link rel="stylesheet" href="/quill/quill.snow.css" />
      </head>
      <Provider store={store}>
        <body className={`${nova.variable} ${inter.variable}`}>{children}</body>
      </Provider>
    </html>
  );
}

export const metadata = {
  title: 'Brain Dance',
  description: 'Discourse',
};
