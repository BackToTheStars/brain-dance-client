import { useState } from 'react';
import Button from '../ui/Button';
import { getGameUserTokenRequest } from '@/modules/user/requests';
// import { setGameInfoIntoStorage } from '@/modules/user/contexts/UserContext';
import { useDispatch } from 'react-redux';
import { addGame } from '@/modules/settings/redux/actions';

const TextInput = ({ label, value, onChange }) => {
  return (
    <div className="w-100 my-3">
      <div className="relative">
        <label
          htmlFor="search_input"
          className="absolute left-[32px] text-xl top-[-12px] dark:bg-black bg-light px-3 dark:text-main-text text-dark-light"
        >
          {label}
        </label>
        <input
          className="border-2 border-main px-6 py-4 rounded-full outline-none bg-transparent w-full dark:text-main-text text-dark-light"
          type="text"
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
};

const EnterGame = ({ params }) => {
  const dispatch = useDispatch();
  const [values, setValues] = useState({ code: '', nickname: '' });
  const [error, setError] = useState('');
  const getOnChange = (field) => (e) =>
    setValues({ ...values, [field]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!values.code || !values.nickname) {
      setError('Заполните все поля');
      return;
    }
    setError('');
    // @todo: перенести в action
    getGameUserTokenRequest(values.code, values.nickname).then((data) => {
      if (data.success) {
        const { info, token } = data;
        const { hash, nickname, role } = info;
        dispatch(addGame({ hash, nickname, role, code: values.code }));
        // setGameInfoIntoStorage(info.hash, {
        //   info,
        //   token,
        // });
        // @todo: получить данные о полном адресе игры
        // location.replace(`/game?hash=${info.hash}`);
      } else {
        setError(data.message);
      }
    });
  };

  return (
    <form
      className="w-full h-full dark:bg-black bg-light py-3 flex flex-col"
      onSubmit={handleSubmit}
    >
      <TextInput
        label="код"
        value={values.code}
        onChange={getOnChange('code')}
      />
      <TextInput
        label="никнейм"
        value={values.nickname}
        onChange={getOnChange('nickname')}
      />
      {!!error && <div className="text-red-300">{error}</div>}
      <div className="mt-3 text-end">
        <Button title="Отмена" className={'py-4'} />
        <Button
          onClick={handleSubmit}
          title="Войти в игру"
          className={'ms-6 py-4'}
        />
      </div>
    </form>
  );
};

export default EnterGame;
