// The same native button and dark palette as the Actions panel. Geometry is
// shared in panels.scss; the wide option occupies two standard button cells.
const PanelButton = ({ children, icon, wide = false, className = '', ...props }) => (
  <button
    type="button"
    {...props}
    className={[
      'btn btn-primary panel-action-button',
      wide && 'panel-action-button--wide',
      className,
    ].filter(Boolean).join(' ')}
  >
    {icon}
    <span className="panel-action-button__label">{children}</span>
  </button>
);

export default PanelButton;
