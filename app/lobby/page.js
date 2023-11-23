'use client';
import GridLayout from '@/modules/lobby/components/layouts/GridLayout';
// import CreateGame from '@/modules/lobby/components/modals/CreateGame';
// import Modal from '@/modules/lobby/components/widgets/Modal';

export default function Home() {
  return (
    <div>
      <GridLayout />
      {/* <Modal title={'Создать игру'} isOpen={false}>
        <CreateGame />
      </Modal> */}
    </div>
  )
}
