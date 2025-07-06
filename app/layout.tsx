import type { Metadata } from 'next'
import './globals.css'
import DatabaseImportExport from '../components/DatabaseImportExport'

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body>
        <DatabaseImportExport />
        {children}
      </body>
    </html>
  )
}
