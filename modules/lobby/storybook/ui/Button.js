const Button = ({
  className,
  children,
  icon,
  labelPosition,
  ...otherProps
}) => {
  return (
    <button
      className={`${className} ${
        labelPosition ? `bd-btn-${labelPosition}` : ''
      }`}
      {...otherProps}
    >
      {labelPosition === 'left' && icon}
      {children ? children : icon}
      {labelPosition === 'right' && icon}
    </button>
  );
};

export default Button;
