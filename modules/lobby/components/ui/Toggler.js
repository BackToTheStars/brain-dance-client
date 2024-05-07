import { useState } from "react";

export const TogglerWrapper = ({ Button, Panel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  return (
    <div className="relative">
      <Button toggle={toggle} />
      {isOpen && Panel}
    </div>
  );
};

export const TogglerPanel = ({ children }) => {
  return (
    <div className="toggler-panel">
      {children}
    </div>
  )
}