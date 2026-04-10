import './globals.css'
import { SocketProvider } from '@/components/SocketProvider'
import PageWrapper from '@/components/PageWrapper'

export const metadata = {
  title: 'UniGrid',
  description: 'Role-based campus management platform',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      </head>
      <body>
        <SocketProvider>
          <PageWrapper>
            {children}
          </PageWrapper>
        </SocketProvider>
      </body>
    </html>
  )
}
