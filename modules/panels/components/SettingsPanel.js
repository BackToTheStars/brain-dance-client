import { useDispatch, useSelector } from 'react-redux';
import { togglePanel } from '../redux/actions';

const SettingsPanel = () => {
  const panels = useSelector((state) => state.panels.panels);
  const dispatch = useDispatch();
  const getTogglePanel = (type) => () => dispatch(togglePanel({ type }));

  return (
    <div className="p-2">
      Settings Panel
      <table>
        <thead>
          <tr>
            <th>Panel</th>
            <th>Show</th>
          </tr>
        </thead>
        <tbody>
          {panels.map((panel) => {
            return (
              <tr>
                <td>{panel.type}</td>
                <td>
                  {panel.isDisplayed ? (
                    <button
                      className="btn btn-success"
                      onClick={getTogglePanel(panel.type)}
                    >
                      On
                    </button>
                  ) : (
                    <button
                      className="btn btn-danger"
                      onClick={getTogglePanel(panel.type)}
                    >
                      Off
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SettingsPanel;
