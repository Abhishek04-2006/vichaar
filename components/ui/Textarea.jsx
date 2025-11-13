export default function Textarea({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <textarea
        className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white resize-none outline-none focus:ring-2 focus:ring-vichaar-primary"
        {...props}
      />
    </div>
  );
}
