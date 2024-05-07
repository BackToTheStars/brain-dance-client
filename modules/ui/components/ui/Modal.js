import { CloseCircleOutlined } from '@ant-design/icons';

const DefaultModal = ({ title, children, isOpen = false, onCancel }) => {
  return (
    <div
      className={`ui-modal ${isOpen ? 'ui-modal_visible' : ''}`}
      onClick={(e) => e.currentTarget === e.target && onCancel()}
    >
      <div className="base-card base-card_modal">
        <div className="base-card__header">
          <h4>{title}</h4>
          <CloseCircleOutlined
            className="ui-modal__close"
            onClick={(e) => {
              e.preventDefault();
              onCancel();
            }}
          />
        </div>
        <div className="base-card__body">{children}</div>
      </div>
    </div>
  );
};

export default DefaultModal;
