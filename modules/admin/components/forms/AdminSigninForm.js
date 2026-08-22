import { Alert, Button, Form, Input } from 'antd';
import { useState } from 'react';
import { useAdminContext } from '../../contexts/AdminContext';

const AdminSigninForm = ({ onSuccessSubmit }) => {
  const { login } = useAdminContext();
  // login отдаёт промис loginRequest: на неверном пароле сервер отвечает 401, и
  // adminRequest поднимает исключение с его текстом. Без этого отказ был бы
  // необработанным reject — форма молчит, а страница остаётся пустой.
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    login(
      {
        nickname: e.target.nickname.value,
        password: e.target.password.value,
      },
      onSuccessSubmit,
    )
      .catch((err) => setError(err?.message || String(err)))
      .finally(() => setPending(false));
  };

  return (
    <form onSubmit={handleSubmit} className="border border-gray-300 p-4 flex flex-col gap-3">
      {!!error && <Alert type="error" showIcon message={error} />}
      <div>
        <Input name="nickname" type="text" placeholder="Login" />
      </div>
      <div>
        <Input name="password" type="password" placeholder="Password" />
      </div>
      <div className="text-end">
        <Button htmlType="submit" loading={pending}>
          Login
        </Button>
      </div>
    </form>
  );
};

export default AdminSigninForm;
