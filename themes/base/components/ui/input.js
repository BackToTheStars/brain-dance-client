import { SIZE_MD } from "@/config/ui/size";

export const Input = ({ className = "", size = SIZE_MD, ...props }) => {
  const classNames = ['base-input', className, `base-input--${size}`].join(' ')
  return (
    <input className={classNames} {...props} />
  );
};
