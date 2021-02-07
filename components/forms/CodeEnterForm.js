// import { useRouter } from 'next/router';
import useEditCodeWarningPopup from '../hooks/edit-code-warning-popup';

const CodeEnterForm = () => {
  // const router = useRouter();
  const { enterGame } = useEditCodeWarningPopup();

  const handleSubmit = (e) => {
    e.preventDefault();
    enterGame(e.target.code.value, e.target.nickname.value);
  };
  return (
    <form className="form-inline" onSubmit={handleSubmit}>
      <div className="form-group mx-sm-3 mb-2">
        <label htmlFor="code" className="sr-only">
          Enter Code
        </label>
        <input
          name="code"
          type="text"
          className="form-control"
          placeholder="Code"
        />
        <input
          name="nickname"
          type="text"
          className="form-control"
          placeholder="Nickname"
        />
      </div>
      <button type="submit" className="btn btn-primary mb-2">
        Enter Game
      </button>
    </form>
  );
};

export default CodeEnterForm;
