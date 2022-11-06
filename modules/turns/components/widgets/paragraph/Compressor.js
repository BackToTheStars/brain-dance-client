import { useSelector } from 'react-redux';

const Compressor = ({ _id, widgetId }) => {
  //
  const panels = useSelector((state) => state.panels);
  const { editTurnId, editWidgetId, editWidgetParams } = panels;

  return <div className="compressed-paragraph-widget">Compressor</div>;
};

export default Compressor;
