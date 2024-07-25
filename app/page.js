import LobbyLayout from '@/modules/lobby/components/layout/LobbyLayout';
import CommonModal from '@/modules/ui/components/modal/CommonModal';

// Упрощённая версия лобби, после рефакторинга
const HomePage = () => {
  return (
    <>
      <LobbyLayout />
      <CommonModal />
    </>
  );
};

export default HomePage;
