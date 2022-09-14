import { useAdminContext } from '../../contexts/AdminContext';

const AdminSigninForm = ({ onSuccessSubmit }) => {
  const { login } = useAdminContext();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(
      {
        nickname: e.target.nickname.value,
        password: e.target.password.value,
      },
      onSuccessSubmit
    );
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3">
      <div className="mb-3">
        <input
          name="nickname"
          type="text"
          className="form-control"
          placeholder="Login"
        />
      </div>
      <div className="mb-3">
        <input
          name="password"
          type="password"
          className="form-control"
          placeholder="Password"
        />
      </div>
      <button type="submit" className="btn btn-primary">
        Login
      </button>
    </form>
  );
};

export default AdminSigninForm;
