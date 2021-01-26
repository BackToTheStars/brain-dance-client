import { useRouter } from 'next/router';

const CodeEnterForm = () => {
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push(`/code?hash=${e.target.code.value}`);
  };
  return (
    <form className="form-inline" onSubmit={handleSubmit}>
      <div className="form-group mx-sm-3 mb-2">
        <label for="code" className="sr-only">
          Enter Code
        </label>
        <input
          name="code"
          type="text"
          className="form-control"
          placeholder="Code"
        />
      </div>
      <button type="submit" className="btn btn-primary mb-2">
        Enter Game
      </button>
    </form>
  );
};

export default CodeEnterForm;
