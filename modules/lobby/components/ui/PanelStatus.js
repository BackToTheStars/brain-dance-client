import Loading from '@/modules/ui/components/common/Loading';
import { ContentButton as Button } from '@/ui/button';
import { useTranslations } from 'next-intl';

// Состояние списка панели: загрузка, отказ запроса и пустой список. Раньше все
// три рисовались одним <Loading/>, поэтому «сервер лёг» было не отличить от
// «игр нет», а панель висела в загрузке навсегда.
export const PanelStatus = ({ loading, error, empty, emptyText, onRetry }) => {
  const t = useTranslations('Lobby');
  if (loading) return <Loading />;
  if (error) {
    return (
      <div className="flex flex-col items-start gap-2 py-2">
        <div>{t('Loading_failed')}</div>
        <div className="text-sm opacity-70 break-all">{error}</div>
        {!!onRetry && (
          <Button size="sm" onClick={onRetry}>
            {t('Retry')}
          </Button>
        )}
      </div>
    );
  }
  if (empty) return <div className="py-2 opacity-70">{emptyText}</div>;
  return null;
};

export default PanelStatus;
