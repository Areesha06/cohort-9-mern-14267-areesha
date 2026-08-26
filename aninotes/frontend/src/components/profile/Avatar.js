import './Avatar.css';

const Avatar = ({ username, size = 40 }) => {
  const initial = username ? username.charAt(0).toUpperCase() : '?';

  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.45 }}>
      {initial}
    </div>
  );
};

export default Avatar;
