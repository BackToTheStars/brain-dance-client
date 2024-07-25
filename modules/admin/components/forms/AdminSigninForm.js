import { Button, Form, Input } from 'antd';
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
      onSuccessSubmit,
    );
  };

  return (
    <form onSubmit={handleSubmit} className="border border-gray-300 p-4 flex flex-col gap-3">
      <div>
        <Input name="nickname" type="text" placeholder="Login" />
      </div>
      <div>
        <Input name="password" type="password" placeholder="Password" />
      </div>
      <div className="text-end">
        <Button htmlType="submit">Login</Button>
      </div>
    </form>
  );
};

export default AdminSigninForm;
