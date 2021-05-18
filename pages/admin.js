import IndexPage from './index.js';
import { useRouter } from 'next/router';

import { API_URL } from '../components/config';
import { setToken } from '../components/lib/token';

const LoginForm = () => {
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(e.target.nickname.value);
    console.log(e.target.password.value);
    fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        nickname: e.target.nickname.value,
        password: e.target.password.value,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        const { token } = data;
        setToken(token);
        router.push('/');
      });
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-4 offset-md-4">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nickname</label>
              <input
                name="nickname"
                type="text"
                className="form-control"
                placeholder="Enter nickname"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
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
        </div>
      </div>
    </div>
  );
};

const AdminPage = () => {
  return (
    <>
      <LoginForm />
      {/* <IndexPage mode="admin" /> */}
    </>
  );
};

export default AdminPage;
