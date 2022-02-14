import '../scss/main.scss';
import { StateInspector } from 'reinspect'; // connects Redux Dev Tools
import { MainProvider } from '../components/contexts/MainContext';

export const App = ({ Component, pageProps }) => {
  return (
    <StateInspector>
      <MainProvider>
        <Component {...pageProps} />
      </MainProvider>
    </StateInspector>
  );
};

export default App;
