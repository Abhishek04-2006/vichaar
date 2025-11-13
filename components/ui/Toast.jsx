export default function Toast({ message, type = "success" }) {
  const colors = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-blue-600",
  };

  return (
    <div
      className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg text-white shadow-lg ${colors[type]}`}
    >
      {message}
    </div>
  );
}
