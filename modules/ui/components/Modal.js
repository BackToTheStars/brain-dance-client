const Modal = ({
  children,
  title = '',
  close,
  buttons = null,
}) => {
  return (
    <>
      <div className="modal d-block" onClick={(e) => {
        if (e.target.classList.contains("modal")) {
          close();
        }
      }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" onClick={close} />
            </div>
            <div className="modal-body">
              {children}
            </div>
            {!!buttons && (
              <div className="modal-footer">
                {buttons}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
};

export default Modal;
