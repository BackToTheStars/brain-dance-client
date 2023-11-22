const Button = ({ link, title, className, ...otherProps }) => {
  return (
    <a
      href={link ? link : '#'}
      className={`inline-flex items-center justify-center py-2 lg:px-12 px-5 rounded-btn-border border-2 border-main bg-main bg-opacity-10 hover:bg-main-dark transition-all group/btn ${className}`}
      {...otherProps}
    >
      <span className="group-hover/btn:scale-[1.2] group-hover/btn:text-white transition-all">
        {title}
      </span>
    </a>
  );
};

export default Button;
