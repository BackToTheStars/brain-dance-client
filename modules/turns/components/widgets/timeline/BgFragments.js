const BgFragments = ({ fragments, duration, onClick = () => {} }) => {
  return (
    <div
      className="bg-fragments w-full flex"
      style={{
        paddingRight: '18px',
        paddingLeft: '3px',
        position: 'absolute',
        top: '4px',
        height: '5px',
      }}
    >
      {fragments.map((fragment, index) => (
        <div
          key={index}
          onClick={() => onClick(fragment)}
          className={'bg-fragment rounded' + (fragment.active ? ' active' : '')}
          style={{
            left: `${(fragment.start / duration) * 100}%`,
            width: `${((fragment.end - fragment.start) / duration) * 100}%`,
          }}
        />
      ))}
    </div>
  );
};

export default BgFragments;