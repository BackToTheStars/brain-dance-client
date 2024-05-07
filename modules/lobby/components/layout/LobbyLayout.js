'use client'
// упрощённый лэайут, рефакторинг компонента GridLayout
import { useState } from 'react';
import Header from './Header';
// import Sidebar from './Sidebar';
import MainContent from './MainContent';

const LobbyLayout = () => {
  const [leftSideWidth, setLeftSideWidth] = useState(null);
  return (
    <div className="flex flex-col h-screen px-4">
      <Header leftSideWidth={leftSideWidth} />
      <MainContent leftSideWidth={leftSideWidth} setLeftSideWidth={setLeftSideWidth} />
      {/* <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <MainContent />
      </div> */}
    </div>
  );
};

export default LobbyLayout;
