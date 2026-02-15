import Image from "next/image";

// Default avatar as SVG data URI
const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23e5e7eb'/%3E%3Cpath d='M50 45c8.284 0 15-6.716 15-15s-6.716-15-15-15-15 6.716-15 15 6.716 15 15 15zm0 5c-13.807 0-25 11.193-25 25v5h50v-5c0-13.807-11.193-25-25-25z' fill='%239ca3af'/%3E%3C/svg%3E";

export default function Avatar({ src, size = 48 }) {
  return (
    <img
      src={src || DEFAULT_AVATAR}
      alt="avatar"
      className="rounded-full object-cover shadow-md bg-gray-200"
      style={{ width: size, height: size }}
    />
  );
}
