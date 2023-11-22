import * as types from './types';
const initialState = {
  modals: {
    createGame: false,
    enterGame: false,
  },
  sidebar: {},
  turns: [],
  theme: '',
  mode: 'byGame',
  section: {
    leftContent: {
      games: [
        {
          title: 'Караоке',
          description:
            'Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus ullam nisi doloribus libero autem voluptatibus dolorem reprehenderit. Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus ullam nisi doloribus libero autem voluptatibus dolorem reprehenderit.',
          link: '#',
          status: 'Открыт',
          turns: '5',
          image: './resources/games/1-min.jpg',
        },
        {
          title: 'Русский Космизм',
          description:
            'Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus ullam nisi doloribus libero autem voluptatibus dolorem reprehenderit. Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus ullam nisi doloribus libero autem voluptatibus dolorem reprehenderit.',
          link: '#',
          status: 'Открыт',
          turns: '12',
          image: './resources/games/2-min.jpg',
        },
        {
          title: 'Философия создания этой игры',
          description:
            'Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus ullam nisi doloribus libero autem voluptatibus dolorem reprehenderit. Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus ullam nisi doloribus libero autem voluptatibus dolorem reprehenderit.Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus ullam nisi doloribus libero autem voluptatibus dolorem reprehenderit. Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus ullam nisi doloribus libero autem voluptatibus dolorem reprehenderit. Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus ullam nisi doloribus libero autem voluptatibus dolorem reprehenderit. Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus ullam nisi doloribus libero autem voluptatibus dolorem reprehenderit.',
          link: '#',
          status: 'Открыт',
          turns: '2',
          image: './resources/games/3-min.jpg',
        },
        {
          title: 'Еще игра',
          description:
            'Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus ullam nisi doloribus libero autem voluptatibus dolorem reprehenderit. Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus ullam nisi doloribus libero autem voluptatibus dolorem reprehenderit. Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus ullam nisi doloribus libero autem voluptatibus dolorem reprehenderit. Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus ullam nisi doloribus libero autem voluptatibus dolorem reprehenderit.',
          link: '#',
          status: 'Закрыт',
          turns: '7',
          image: './resources/games/4-min.jpg',
        },
        {
          title: 'Караоке',
          description:
            'Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus ullam nisi doloribus libero autem voluptatibus dolorem reprehenderit. Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus ullam nisi doloribus libero autem voluptatibus dolorem reprehenderit.',
          link: '#',
          status: 'Открыт',
          turns: '46',
          image: './resources/games/5-min.jpg',
        },
        {
          title: 'Русский Космизм',
          description:
            'Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus ullam nisi doloribus libero autem voluptatibus dolorem reprehenderit. Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus ullam nisi doloribus libero autem voluptatibus dolorem reprehenderit.',
          link: '#',
          status: 'Открыт',
          turns: '104',
          image: './resources/games/6-min.jpg',
        },
      ],
    },
  },
};

export const lobbyReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case types.LOBBY_TURNS_LOAD: {
      return {
        ...state,
        turns: payload,
      };
    }
    case types.LOBBY_SIDEBAR: {
      return {
        ...state,
        sidebar: payload,
      };
    }
    case types.LOBBY_MODE_SET: {
      return {
        ...state,
        mode: payload,
      }
    }
  }
  return state;
};
