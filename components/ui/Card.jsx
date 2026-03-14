export default function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white dark:bg-vichaar-cardDark p-5 rounded-2xl shadow-md ${className}`}
    >
      {children}
    </div>
  );
}
