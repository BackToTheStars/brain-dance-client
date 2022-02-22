import { panelSpacer } from '@/config/ui';

const UIPanel = ({ children }) => {
  // const {
  //   state: { classesPanelIsHidden },
  //   minimapState: { minimapSize, isHidden },
  // } = useUiContext();

  // const [height, setHeight] = useState(0);

  // useEffect(() => {
  //   if (classesPanelIsHidden) return;
  //   if (isHidden) {
  //     setHeight(window.innerHeight - 2 * panelSpacer); // отправили доступную высоту для панели классов в State
  //   } else {
  //     setHeight(minimapSize.top - 2 * panelSpacer);
  //   }
  // }, [minimapSize, isHidden, classesPanelIsHidden]);

  const panelIsHidden = false;
  const height = window.innerHeight - 2 * panelSpacer;

  return (
    <div
      className={`${panelIsHidden ? 'hidden' : ''} po panel`}
      id="classMenu"
      style={{ height: `${height}px` }}
    >
      {children}
    </div>
  );
};

export default UIPanel;
