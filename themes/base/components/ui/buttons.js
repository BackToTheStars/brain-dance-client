import { SIZE_MD } from '@/config/ui/size';

export const Button = ({
  children,
  className = '',
  size = SIZE_MD,
  ...props
}) => {
  const classNames = ['base-button', className, `base-button--${size}`].join(
    ' '
  );
  return (
    <button className={classNames} {...props}>
      {children.length === 1 ? (
        <span className="flex items-center">
          {children}
          {'\u200B'}
        </span>
      ) : (
        children
      )}
    </button>
  );
};
