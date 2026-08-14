// Презентационный список кнопок панели. Живёт отдельным модулем намеренно:
// раньше он экспортировался из ButtonsPanel.js, который сам импортирует все
// режимы кнопок, — получался цикл (режим → ButtonsPanel → режим). В dev это
// проходило, а в прод-сборке порядок инициализации модулей менялся, и карта
// buttonSettings читала ещё не инициализированный default режима:
// «Cannot access 'm' before initialization» на старте приложения.
export const Buttons = ({ buttons }) => {
  return (
    <>
      {buttons.map((button, index) =>
        !!button && (!button.show || button.show()) ? (
          <button
            key={index}
            className="btn btn-primary"
            data-test-id={button.testId}
            onClick={() => button.callback()}
          >
            {button.text}
          </button>
        ) : (
          <div key={index} className="empty-button-space"></div>
        )
      )}
    </>
  );
};

export default Buttons;
