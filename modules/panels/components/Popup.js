const PanelPopup = ({children}) => {
  return (
    <div
      id="modalBackground"
    >
      <div id="modal" className="container">
        {children}
      </div>
    </div>
  )
}

export default PanelPopup