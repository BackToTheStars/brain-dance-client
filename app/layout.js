'use client';

import 'jquery-ui/themes/base/all.css';
import 'react-image-crop/dist/ReactCrop.css';
import { Provider } from 'react-redux';
import { useStore } from '../redux/store';

export default function RootLayout({ children }) {
  const store = useStore();
  return (
    <html lang="ru">
      <head>
        <script src="/js/jquery.js"></script>
        <script src="/js/jquery-ui/jquery-ui.min.js"></script>
        <link rel="stylesheet" href="/quill/quill.snow.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css" />
      </head>
      <Provider store={store}>
        <body>{children}</body>
      </Provider>
    </html>
  );
}
