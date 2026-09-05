'use client'

import { useBackendHealth } from '@/lib/hooks'
import styles from './StatusIndicator.module.css'

export const StatusIndicator = () => {
  const { isOnline, loading } = useBackendHealth()

  if (loading) {
    return (
      <div className={styles.status}>
        <span className={`${styles.dot} ${styles.checking}`} />
        <span className={styles.label}>Connecting...</span>
      </div>
    )
  }

  return (
    <div className={`${styles.status} ${isOnline ? styles.online : styles.offline}`}>
      <span className={styles.dot} />
      <span className={styles.label}>
        {isOnline ? 'Backend Connected' : 'Backend Offline'}
      </span>
    </div>
  )
}
