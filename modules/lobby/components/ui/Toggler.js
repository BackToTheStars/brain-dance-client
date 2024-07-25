import { useState } from 'react';

export const TogglerWrapper = ({ Button, Panel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  return (
    <div className="relative">
      <Button toggle={toggle} className={isOpen ? 'active' : ''} />
      {isOpen && Panel}
    </div>
  );
};

export const TogglerPanel = ({ children, style = {} }) => {
  return (
    <div className="toggler-panel" style={style}>
      {children}
    </div>
  );
};
