import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'Expiry Tracker Admin',
  description: 'Admin panel for Food & Document Expiry Tracker',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
