'use client'

import { useState } from 'react'
import styles from './LoginModal.module.css'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess: (email: string) => void
  queryCount: number
}

export const LoginModal = ({ isOpen, onClose, onLoginSuccess, queryCount }: LoginModalProps) => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please fill in all required fields.')
      return
    }
    setError('')
    onLoginSuccess(email.split('@')[0] || email)
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className={styles.header}>
          <div className={styles.badge}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            {queryCount >= 3 ? '3 Free Queries Reached' : 'Welcome Back'}
          </div>

          <h2 className={styles.title}>
            {queryCount >= 3 ? 'Unlock Full SQL Analyst Access' : isSignUp ? 'Create an Account' : 'Sign in to SQL Analyst'}
          </h2>

          <p className={styles.subtitle}>
            {queryCount >= 3
              ? `You've submitted ${queryCount} queries! Log in now to save your chat threads, run unlimited queries, and unlock AI schema visualizers.`
              : 'Sign in to access saved query threads, custom DB connections, and AI insights.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          {isSignUp && (
            <div className={styles.inputGroup}>
              <label htmlFor="name-input">Full Name</label>
              <input
                id="name-input"
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="email-input">Email Address</label>
            <input
              id="email-input"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password-input">Password</label>
            <input
              id="password-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn}>
            {isSignUp ? 'Create Account & Continue' : 'Sign In'}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </form>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.switchBtn}
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError('')
            }}
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>

          <button type="button" className={styles.guestBtn} onClick={onClose}>
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  )
}
