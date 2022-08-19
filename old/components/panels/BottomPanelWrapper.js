import {
  PANEL_LINES,
  PANEL_PASTE,
  useInteractionContext,
} from '../contexts/InteractionContext';
import QuotesPanel from './QuotesPanel';
import PasteTurnPanel from './PasteTurnPanel';

const BottomPanelWrapper = () => {
  // обёртка для нижней выезжающей панели
  const { bottomPanelSettings } = useInteractionContext();
  const { panelType, preparedLines } = bottomPanelSettings;

  return (
    <div className={`${!panelType ? 'hidden' : ''} bottom-panel panel`}>
      {panelType === PANEL_LINES && (
        <QuotesPanel preparedLines={preparedLines} />
      )}
      {panelType === PANEL_PASTE && <PasteTurnPanel />}
    </div>
  );
};

export default BottomPanelWrapper;
