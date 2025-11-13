import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

    export const metadata = {
  title: "VICHAAR – Share Your Thoughts",
  description:
    "A modern thought-sharing platform built with Next.js, Firebase & Tailwind CSS.",
  openGraph: {
    title: "VICHAAR – Share Your Thoughts",
    description: "Write, explore, and share thoughts in real time.",
    url: "https://vichaar.vercel.app",
    siteName: "Vichaar",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VICHAAR – Share Your Thoughts",
    description: "Write, explore, and share thoughts in real time.",
    images: ["/og-image.png"],
  },
};



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
