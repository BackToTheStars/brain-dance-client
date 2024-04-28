import { UserProvider } from '@/modules/user/contexts/UserContext';
import { Provider } from 'react-redux';
import { initializeStore } from '../redux/storybook/store';
import '@/themes/v1/scss/style.scss';

/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

const store = initializeStore();

export const decorators = [
  (Story) => (
    <UserProvider>
      <Provider store={store}>
        <Story />
      </Provider>
    </UserProvider>
  ),
];

export default preview;
