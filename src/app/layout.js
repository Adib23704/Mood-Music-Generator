import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'MoodTunes - Music for Every Mood',
  description: 'Discover personalized music playlists based on your current mood using AI-powered sentiment analysis and Spotify integration.',
  keywords: 'music, playlist, mood, spotify, ai, sentiment analysis',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#8b5cf6" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
