import 'antd/dist/antd.css';
import '../scss/style.scss';
import { Provider } from 'react-redux';
import { useStore } from '../redux/store';

const App = ({ Component, pageProps }) => {
  const store = useStore(pageProps.initialReduxState);

  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
};
export default App;
