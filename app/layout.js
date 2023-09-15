'use client';

import 'jquery-ui/themes/base/all.css';
import '../scss/style.scss';
import { Provider } from 'react-redux';
import { useStore } from '../redux/store';

export default function RootLayout({ children }) {
  const store = useStore();
  return (
    <html lang="ru">
      <head>
        <script src="/js/jquery.js"></script>
        <script src="/js/jquery-ui/jquery-ui.min.js"></script>
        <script src="/quill/quill.min.js"></script>
        <link rel="stylesheet" href="/quill/quill.snow.css" />
      </head>
      <Provider store={store}>
        <body>{children}</body>
      </Provider>
    </html>
  );
}

export const metadata = {
  title: 'Brain Dance',
  description: 'Discourse',
};
