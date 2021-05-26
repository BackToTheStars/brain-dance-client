import '../css/styles.css';
import { StateInspector } from 'reinspect'; // connects Redux Dev Tools

export const App = ({ Component, pageProps }) => {
  return (
    <StateInspector>
      <Component {...pageProps} />
    </StateInspector>
  );
};

export default App;
