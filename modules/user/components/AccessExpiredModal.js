'use client';

import { Button, Modal } from 'antd';
import { useTranslations } from 'next-intl';
import { TID } from '@/config/testIds';

// One window for the canvas, the entry dialog and the presence socket. Controlled
// rather than Modal.confirm: the static methods do not see the theme context.
const AccessExpiredModal = ({ open, onLobby, onStay }) => {
  const t = useTranslations('UI.accessExpired');
  return (
    <Modal
      open={open}
      title={t('Title')}
      closable={false}
      mask={{ closable: false }}
      keyboard={false}
      modalRender={(node) => (
        <div data-test-id={TID.accessExpired.root}>{node}</div>
      )}
      footer={[
        <Button
          key="lobby"
          data-test-id={TID.accessExpired.lobby}
          onClick={onLobby}
        >
          {t('Back_to_lobby')}
        </Button>,
        <Button
          key="stay"
          type="primary"
          data-test-id={TID.accessExpired.stay}
          onClick={onStay}
        >
          {t('Stay_visitor')}
        </Button>,
      ]}
    >
      <p className="mb-0">{t('Text')}</p>
    </Modal>
  );
};

export default AccessExpiredModal;
