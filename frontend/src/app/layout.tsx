

import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI SQL Analyst — Where Data Meets Intelligence',
  description:
    'Ask questions about your database in plain English and get instant, intelligent SQL-powered insights.',
  keywords: 'AI, SQL, database, analytics, data analysis, natural language',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider afterSignOutUrl="/" >
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
// import type { Metadata } from 'next'
// import './globals.css'

// export const metadata: Metadata = {
//   title: 'AI SQL Analyst — Where Data Meets Intelligence',
//   description: 'Ask questions about your database in plain English and get instant, intelligent SQL-powered insights.',
//   keywords: 'AI, SQL, database, analytics, data analysis, natural language',
// }

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <html lang="en">
//       <head>
//         <link rel="preconnect" href="https://fonts.googleapis.com" />
//         <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
//       </head>
//       <body>
//         {children}
//       </body>
//     </html>
//   )
// }

