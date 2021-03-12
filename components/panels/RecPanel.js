import { useUiContext } from '../contexts/UI_Context';

function RecPanel(props) {
  const { recPanelState, recPanelDispatch } = useUiContext();
  return (
    <>
      {recPanelState.isHidden ? (
        ''
      ) : (
        <div>
          <div className="rec-label"></div>
          <div className="rec-text">
            <h2>REC</h2>
          </div>
        </div>
      )}
    </>
  );
}

export default RecPanel;
