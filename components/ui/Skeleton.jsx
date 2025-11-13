export default function Skeleton({ height = 20 }) {
  return (
    <div
      className="animate-pulse rounded-lg bg-gray-300 dark:bg-gray-700"
      style={{ height }}
    ></div>
  );
}
