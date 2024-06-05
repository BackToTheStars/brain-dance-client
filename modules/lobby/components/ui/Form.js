import { useState } from 'react';
import Button from './Button';

export const TextInput = ({ label, value, onChange }) => {
  return (
    <div className="w-100 my-3 relative">
      <label className="lobby-form__input-label">{label}</label>
      <input
        className="lobby-form__input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export const RadioInput = ({ label, value, name, onChange, options }) => {
  return (
    <div className="w-100 my-3 relative flex gap-4">
      {!!label && <label className="lobby-form__input-label">{label}</label>}
      {options.map((option) => {
        return (
          <div
            key={option.value}
            className="flex gap-2 cursor-pointer"
            onClick={() => onChange(option.value)}
          >
            <input
              className="cursor-pointer"
              type="radio"
              name={name}
              value={option.value}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
            />
            <label className="cursor-pointer">{option.label}</label>
          </div>
        );
      })}
    </div>
  );
};

export const LobbyForm = ({
  onFinish,
  onCancel: parentCancel,
  inputs = [],
  error,
  confirmText = 'Ок',
}) => {
  const [values, setValues] = useState(
    inputs.reduce(
      (acc, input) => ({
        ...acc,
        [input.name]: input.defaultValue || '',
      }),
      {}
    )
  );
  const getOnChange = (name) => (value) =>
    setValues({ ...values, [name]: value });

  const onSubmit = (e) => {
    e.preventDefault();
    onFinish(values);
  };

  const onCancel = (e) => {
    e.preventDefault();
    parentCancel();
  };

  return (
    <form className="lobby-form" onSubmit={onSubmit}>
      {inputs.map(({ type = 'text', name, label, options = [] }) => {
        // @todo: вынести типы в константы
        if (type === 'text') {
          return (
            <TextInput
              key={name}
              label={label}
              value={values[name]}
              onChange={getOnChange(name)}
            />
          );
        } else if (type === 'radio') {
          return (
            <RadioInput
              key={name}
              label={label}
              name={name}
              value={values[name]}
              onChange={getOnChange(name)}
              options={options}
            />
          );
        }
        return <div key={name}>Unknown Field Type {type}</div>;
      })}
      {!!error && <div className="text-red-300">{error}</div>}
      <div className="mt-3 text-end">
        <Button onClick={onCancel} className="mr-3">
          Отмена
        </Button>
        <Button onClick={onSubmit}>{confirmText}</Button>
      </div>
    </form>
  );
};
