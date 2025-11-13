import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'VICHAAR',
  description: 'A platform to share thoughts and express freely.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        {/* Shared Navbar */}
        <Navbar />
        
        {/* Page Content */}
        <main className="min-h-[80vh] px-4">{children}</main>
        
        {/* Shared Footer */}
        <Footer />
      </body>
    </html>
  )
}
