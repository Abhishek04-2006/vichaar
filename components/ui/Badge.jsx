export default function Badge({ children, color = "blue" }) {
  const colors = {
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    green: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    red: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[color]}`}>
      {children}
    </span>
  );
}
