import { useUiContext } from '../contexts/UI_Context';

function MinimapPanel (props) {
  const {
    minimapState,
    minimapDispatch,
  } = useUiContext();
  
  return <>
    {minimapState.isHidden ? '' : (
      <div className="minimap-panel">
        <p>minimap</p>
      </div>
      )
    }
  </>;
}

export default MinimapPanel;
