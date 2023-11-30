'use client';

import CommonModal from '@/modules/lobby/components/modals/Common';

const LobbyLayout = ({ children }) => {
  return (
    <>
      {children}
      <CommonModal />
    </>
  );
};

export default LobbyLayout;
