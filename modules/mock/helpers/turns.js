import { GRID_CELL_X } from '@/config/ui';

export const defaultMockTurn = {
  _id: '60e5451e39300d0017646aa6',
  position: {
    x: GRID_CELL_X,
    y: GRID_CELL_X,
  },
  size: {
    width: 400,
    height: 200,
  },
  contentType: 'comment',
  pictureOnly: false,
  gameId: '60086b9382f94025244b2373',
  colors: {
    background: '#eced9a',
    font: '#0a0a0a',
    // background: '',
    // font: '',
  },
  quotes: [
    {
      type: 'text',
      _id: '63438c7a27fbaa00162fb668',
      id: 1,
      text: 'Лаборатория Когнитивных Интерфейсов',
    },
    {
      type: 'text',
      _id: '63438c7a27fbaa00162fb669',
      id: 2,
      text: 'Britannica',
    },
  ],
  widgetsCount: 0,
  widgets: {
    header: [
      {
        id: 'h_1',
        show: true,
        text: 'Лаборатория Когнитивных Интерфейсов',
      },
    ],
    picture: [
      {
        id: 'i_1',
        show: false,
        url: 'https://s7.gifyu.com/images/Tim_Berners-Lee-chair-1.jpg',
        quotes: [],
      },
    ],
    video: [
      {
        id: 'v_1',
        show: false,
        url: null,
      },
    ],
    source: [
      {
        id: 's_1',
        show: true,
        date: '2021-07-06T00:00:00.000Z',
        url: 'https://google.com',
      },
    ],
    paragraph: [
      {
        id: 'p_1',
        show: true,
        inserts: [
          {
            insert: 'Нам нужна современная ',
          },
          {
            insert: 'Лаборатория Когнитивных Интерфейсов',
            attributes: {
              background: '#9cf5ff',
              id: '1',
            },
          },
          {
            insert:
              '. Нужно массово связать само Знание, двинуть его в школы и университеты. Оно разорвано, спрятано, стыдливо задвинуто под шкаф, нужно собрать его воедино. Как британцы в своё время собрали ',
          },
          {
            insert: 'Britannica',
            attributes: {
              background: '#9cf5ff',
              id: '2',
            },
          },
          {
            insert:
              '. Иначе мы так и проведём следующие 100 лет обсуждая микрокредитных коллекторов и нищенские пенсии стариков, и "читая советские газеты перед обедом".\n',
          },
        ],
        scrollPosition: 0,
        quotes: [
          {
            type: 'text',
            _id: '63438c7a27fbaa00162fb668',
            id: 1,
            text: 'Лаборатория Когнитивных Интерфейсов',
          },
          {
            type: 'text',
            _id: '63438c7a27fbaa00162fb669',
            id: 2,
            text: 'Britannica',
          },
        ],
      },
    ],
    compressed: [
      {
        id: 'c_1',
        show: false,
        uncompressedHeight: 198,
      },
    ],
  },
  dWidgets: {
    h_1: {
      id: 'h_1',
      show: true,
      text: 'Лаборатория Когнитивных Интерфейсов',
      type: 'header',
    },
    i_1: {
      id: 'i_1',
      show: false,
      url: 'https://s7.gifyu.com/images/Tim_Berners-Lee-chair-1.jpg',
      quotes: [],
      type: 'picture',
    },
    v_1: {
      id: 'v_1',
      show: false,
      url: 'https://www.youtube.com/watch?v=RrY-hlC-YKY',
      type: 'video',
    },
    s_1: {
      id: 's_1',
      show: true,
      date: '2021-07-06T00:00:00.000Z',
      url: 'https://google.com',
      type: 'source',
    },
    p_1: {
      id: 'p_1',
      show: true,
      inserts: [
        {
          insert: 'Нам нужна современная ',
        },
        {
          insert: 'Лаборатория Когнитивных Интерфейсов',
          attributes: {
            background: '#9cf5ff',
            id: '1',
          },
        },
        {
          insert:
            '. Нужно массово связать само Знание, двинуть его в школы и университеты. Оно разорвано, спрятано, стыдливо задвинуто под шкаф, нужно собрать его воедино. Как британцы в своё время собрали ',
        },
        {
          insert: 'Britannica',
          attributes: {
            background: '#9cf5ff',
            id: '2',
          },
        },
        {
          insert:
            '. Иначе мы так и проведём следующие 100 лет обсуждая микрокредитных коллекторов и нищенские пенсии стариков, и "читая советские газеты перед обедом".\n',
        },
      ],
      scrollPosition: 0,
      quotes: [
        {
          type: 'text',
          _id: '63438c7a27fbaa00162fb668',
          id: 1,
          text: 'Лаборатория Когнитивных Интерфейсов',
        },
        {
          type: 'text',
          _id: '63438c7a27fbaa00162fb669',
          id: 2,
          text: 'Britannica',
        },
      ],
      type: 'paragraph',
    },
    c_1: {
      id: 'c_1',
      show: false,
      uncompressedHeight: 198,
      type: 'compressed',
    },
  },
  widgetToShow: [
    {
      type: 'source',
      id: 's_1',
    },
    {
      type: 'paragraph',
      id: 'p_1',
    },
  ],
};

export const getDefaultMockTurnWithArgs = (args) => {
  const copiedTurn = { ...defaultMockTurn };
  copiedTurn.contentType = args.contentType || 'picture';
  copiedTurn.colors = {
    background: args.background || null,
    font: args.font || null,
  }
  copiedTurn.size = {
    width: args.width || 400,
    height: args.height || 200,
  };
  if (args.pictureOnly) {
    copiedTurn.pictureOnly = true;
    for (const widgetId in copiedTurn.dWidgets) {
      copiedTurn.dWidgets[widgetId] = {
        ...copiedTurn.dWidgets[widgetId],
        show: false,
      };
    }
    copiedTurn.dWidgets.i_1.show = true;
    return copiedTurn;
  }
  copiedTurn.dWidgets = {
    ...copiedTurn.dWidgets,
    h_1: {
      ...copiedTurn.dWidgets.h_1,
      show: !!args.showHeader,
    },
    i_1: {
      ...copiedTurn.dWidgets.i_1,
      show: !!args.showImage,
      url: args.showImage
        ? args.pictureUrl ||
          'https://s7.gifyu.com/images/Tim_Berners-Lee-chair-1.jpg'
        : '',
    },
    v_1: {
      ...copiedTurn.dWidgets.v_1,
      show: !!args.showVideo,
      url: args.showVideo
        ? args.videoUrl || 'https://www.youtube.com/watch?v=RrY-hlC-YKY'
        : '',
    },
  };

  return copiedTurn;
};
