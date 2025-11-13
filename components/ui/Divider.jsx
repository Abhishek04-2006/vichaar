export default function Divider({ text }) {
  return (
    <div className="flex items-center gap-4 my-8">
      <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700"></div>
      {text && (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {text}
        </span>
      )}
      <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700"></div>
    </div>
  );
}
