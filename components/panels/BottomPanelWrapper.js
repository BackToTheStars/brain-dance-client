import { useInteractionContext } from '../contexts/InteractionContext';
import QuotesPanel from './QuotesPanel';
import PasteTurnPanel from './PasteTurnPanel';

const BottomPanelWrapper = () => {
  // обёртка для нижней выезжающей панели
  const { bottomPanelSettings } = useInteractionContext();
  const { isHidden, setIsHidden, panelType, preparedLines } =
    bottomPanelSettings;

  return (
    <div className={`${isHidden ? 'hidden' : ''} bottom-panel panel`}>
      {panelType === 'quotes-panel' && (
        <QuotesPanel preparedLines={preparedLines} />
      )}
      {panelType === 'paste-turn-panel' && <PasteTurnPanel />}
    </div>
  );
};

export default BottomPanelWrapper;
