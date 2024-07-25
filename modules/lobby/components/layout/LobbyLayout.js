'use client';
// упрощённый лэайут, рефакторинг компонента GridLayout
import { useEffect, useState } from 'react';
import Header from './Header';
// import Sidebar from './Sidebar';
import MainContent from './MainContent';
import { useDispatch } from 'react-redux';
import { loadSettings } from '@/modules/settings/redux/actions';
import { MainLayoutProvider } from './MainLayoutContext';

const LobbyLayout = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadSettings());
  }, []);
  return (
    <MainLayoutProvider>
      <div className="flex flex-col h-screen px-4">
        <Header />
        <MainContent />
        {/* <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <MainContent />
      </div> */}
      </div>
    </MainLayoutProvider>
  );
};

export default LobbyLayout;
