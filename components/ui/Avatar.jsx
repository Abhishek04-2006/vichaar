export default function Avatar({ src, size = 48 }) {
  return (
    <img
      src={src || "/default-avatar.png"}
      alt="avatar"
      className="rounded-full object-cover shadow-md"
      width={size}
      height={size}
    />
  );
}
