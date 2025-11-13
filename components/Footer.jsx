export default function Footer() {
  return (
    <footer className="bg-gray-100 mt-10 py-6 text-center border-t border-gray-200">
      <p className="text-gray-600 text-sm">
        © {new Date().getFullYear()} <span className="font-semibold text-blue-700">VICHAAR</span>.  
        All Rights Reserved.
      </p>
      <p className="text-xs text-gray-500 mt-2">
        A platform to share your views, express freely, and inspire change 🇮🇳
      </p>
    </footer>
  )
}
