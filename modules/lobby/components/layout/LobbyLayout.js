'use client';
// упрощённый лэайут, рефакторинг компонента GridLayout
import { useEffect, useState } from 'react';
import Header from './Header';
// import Sidebar from './Sidebar';
import MainContent from './MainContent';
import { useDispatch } from 'react-redux';
import { loadSettings } from '@/modules/settings/redux/actions';

const LobbyLayout = () => {
  const dispatch = useDispatch();
  const [leftSideWidth, setLeftSideWidth] = useState(null);
  useEffect(() => {
    dispatch(loadSettings());
  }, []);
  return (
    <div className="flex flex-col h-screen px-4">
      <Header leftSideWidth={leftSideWidth} />
      <MainContent
        leftSideWidth={leftSideWidth}
        setLeftSideWidth={setLeftSideWidth}
      />
      {/* <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <MainContent />
      </div> */}
    </div>
  );
};

export default LobbyLayout;
