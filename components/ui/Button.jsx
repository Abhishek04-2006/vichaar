export default function Button({
  children,
  variant = "primary",
  onClick,
  className = "",
  ...props
}) {
  const base =
    "px-4 py-2 rounded-lg font-medium transition active:scale-95";

  const variants = {
    primary:
      "bg-vichaar-primary text-white hover:bg-vichaar-primaryDark dark:bg-vichaar-primaryDark dark:hover:bg-vichaar-primary",
    outline:
      "border border-gray-400 text-gray-800 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800",
    danger:
      "bg-vichaar-danger text-white hover:bg-vichaar-dangerDark",
    subtle:
      "text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
