const Button = ({ link, title, className, ...otherProps }) => {
  return (
    <a
      href={link ? link : '#'}
      // className={`inline-flex items-center justify-center py-2 lg:px-12 px-5 rounded-btn-border border-2 border-main-light dark:bg-main-dark dark:text-white bg-main text-white hover:bg-main-dark transition-all group/btn ${className}`}
      className={`inline-flex items-center justify-center py-2 px-3 rounded-btn-border border-2 border-main-light dark:bg-main-dark dark:text-white bg-main text-white hover:bg-main-dark transition-all group/btn ${className}`}
      {...otherProps}
    >
      <span className="group-hover/btn:scale-[1.2] group-hover/btn:text-white text-white transition-all inline-flex">
        {title}
      </span>
    </a>
  );
};

export default Button;
