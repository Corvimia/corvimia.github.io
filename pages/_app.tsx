import { AppProps } from 'next/app'
import '../styles/globals.css'
import { TimelineProvider } from '@/hooks/use-timeline'
import { TaskProvider } from '@/hooks/use-tasks'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <TimelineProvider>
      <TaskProvider>
        <Component {...pageProps} />
      </TaskProvider>
    </TimelineProvider>
  )
} 