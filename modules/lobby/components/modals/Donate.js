import { useTranslations } from 'next-intl';

const DonateModal = () => {
  const t = useTranslations('Lobby');
  return t('Payment_methods');
};

export default DonateModal;
