import { MailOutlined, GithubOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import { useState } from 'react';
import '../storybook/scss/index.scss';
import Button from './ui/Button';
import { ThemeStoryBook } from './Theme';
import { DropdownBlock, DropdownList } from './ui/DropdownList';

function getItem(label, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label,
    type,
  };
}

const setButtons = () => {
  const buttons = [
    {
      title: 'Посмотреть все',
      value: 'all-btn',
    },
    {
      title: 'Большие',
      value: 'xl',
    },
    {
      title: 'Средние',
      value: 'lg',
    },
    {
      title: 'Маленький',
      value: 'sm',
    },
    {
      title: 'Иконка',
      value: 'icon',
    },
    {
      title: 'С иконкой',
      value: 'with-icon',
    },
    {
      title: 'Без иконкой',
      value: 'with-no-icon',
    },
  ];

  return buttons.map((el) => getItem(`${el.title}`, `${el.value}`));
};

const items = [
  getItem('Components', 'sub1', <MailOutlined />, [
    getItem('Кнопки', 'g1', null, [...setButtons()], 'group'),
    getItem('Карточки', 'g2', null, [getItem('Основная', 'card')], 'group'),
    getItem(
      'Выпадающие списки',
      'g3',
      null,
      [getItem('С текстом', 'dropdownList')],
      'group'
    ),
  ]),
];

const StoryBook = () => {
  const [value, setValue] = useState('');
  const [theme, setTheme] = useState('dark');

  const onClick = (e) => {
    setValue(e.key);
  };

  return (
    <div className={`flex relative storybook ${theme}`}>
      <div className="w-3/12 h-screen p-4">
        <Menu
          onClick={onClick}
          style={{
            width: '100%',
            height: '100%',
          }}
          defaultSelectedKeys={['1']}
          defaultOpenKeys={['sub1']}
          mode="inline"
          items={items}
        />
      </div>
      <div className="w-9/12 p-4">
        {value === 'all-btn' && (
          <div className="flex gap-3">
            <Button className={'bd-btn bd-btn-main bd-btn-border'}>
              Я кнопка
            </Button>
            <Button
              className={'bd-btn bd-btn-main bd-btn-border'}
              labelPosition="right"
              icon={<MailOutlined />}
            >
              Я кнопка c иконкой слева
            </Button>
            <Button
              className={'bd-btn bd-btn-main bd-btn-border'}
              labelPosition="left"
              icon={<MailOutlined />}
            >
              Я кнопка c иконкой справа
            </Button>
            <Button
              className={'bd-btn bd-btn-main bd-btn-border bd-btn-icon'}
              icon={<MailOutlined />}
            />
          </div>
        )}
        {value === 'xl' && (
          <div className="flex gap-3">
            <Button className={'bd-btn bd-btn-main bd-btn-xl bd-btn-border'}>
              Я кнопка
            </Button>
            <Button
              className={'bd-btn bd-btn-main bd-btn-border bd-btn-xl'}
              labelPosition="right"
              icon={<MailOutlined />}
            >
              Я кнопка c иконкой
            </Button>
            <Button
              className={
                'bd-btn bd-btn-main bd-btn-xl bd-btn-border bd-btn-icon'
              }
              icon={<MailOutlined />}
            />
          </div>
        )}
        {value === 'sm' && (
          <div className="flex gap-3">
            <Button className={'bd-btn bd-btn-main bd-btn-sm bd-btn-border'}>
              Я кнопка
            </Button>
            <Button
              className={'bd-btn bd-btn-main bd-btn-border bd-btn-sm'}
              labelPosition="right"
              icon={<MailOutlined />}
            >
              Я кнопка c иконкой
            </Button>
            <Button
              className={
                'bd-btn bd-btn-main bd-btn-sm bd-btn-border bd-btn-icon'
              }
              icon={<MailOutlined />}
            />
          </div>
        )}
        {value === 'lg' && (
          <div className="flex gap-3">
            <Button className={'bd-btn bd-btn-main bd-btn-lg bd-btn-border'}>
              Я кнопка
            </Button>
            <Button
              className={'bd-btn bd-btn-main bd-btn-border bd-btn-lg'}
              labelPosition="right"
              icon={<MailOutlined />}
            >
              Я кнопка c иконкой
            </Button>
            <Button
              className={
                'bd-btn bd-btn-main bd-btn-lg bd-btn-border bd-btn-icon'
              }
              icon={<MailOutlined />}
            />
          </div>
        )}
        {value === 'icon' && (
          <div className="flex gap-2">
            <div>
              <Button
                className={'bd-btn bd-btn-main bd-btn-border bd-btn-icon'}
                icon={<MailOutlined />}
              />
            </div>
            <div>
              <Button
                className={'bd-btn bd-btn-main bd-btn-border bd-btn-icon'}
                icon={<GithubOutlined />}
              />
            </div>
          </div>
        )}
        {value === 'with-icon' && (
          <div className="flex gap-3">
            <Button
              className={'bd-btn bd-btn-main bd-btn-border'}
              labelPosition="right"
              icon={<MailOutlined />}
            >
              Я кнопка c иконкой
            </Button>
            <Button
              className={'bd-btn bd-btn-main bd-btn-border'}
              labelPosition="left"
              icon={<MailOutlined />}
            >
              Я кнопка c иконкой
            </Button>
          </div>
        )}
        {value === 'with-no-icon' && (
          <>
            <Button className={'bd-btn bd-btn-main bd-btn-border'}>
              Я кнопка c иконкой
            </Button>
          </>
        )}
        {value === 'card' && <>Карточка</>}
        {value === 'dropdownList' && (
          <>
            <DropdownBlock title={'Привет всем'}>
              <div>И снова мы здесь</div>
              <div>Здорово что зашел</div>
            </DropdownBlock>
          </>
        )}
      </div>
      <div className="absolute right-4 top-4">
        <ThemeStoryBook theme={theme} toggleTheme={setTheme} />
      </div>
    </div>
  );
};

export default StoryBook;
