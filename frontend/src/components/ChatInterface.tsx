'use client'

import { useState, useRef } from 'react'
import styles from './ChatInterface.module.css'

interface ChatInterfaceProps {
  onSendMessage: (message: string) => Promise<void>
  loading: boolean
  error: string | null
  isEmpty: boolean
}

const SUGGESTED_QUERIES = [
  'Show me total sales by category',
  'Which customers have the highest order value?',
  'List top 10 products by revenue',
  'Show monthly trend for last 6 months',
]

export const ChatInterface = ({ onSendMessage, loading, error, isEmpty }: ChatInterfaceProps) => {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || loading) return

    try {
      await onSendMessage(trimmed)
      setInput('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    } catch (err) {
      console.error('Failed to send message:', err)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
  }

  const handleSuggestion = (query: string) => {
    setInput(query)
    textareaRef.current?.focus()
  }

  const hasInput = input.trim().length > 0

  return (
    <div className={`${styles.wrapper} ${isEmpty ? styles.centered : styles.bottom}`}>
      {/* Hero text when empty */}
      {isEmpty && (
        <div className={styles.hero}>
          <p className={styles.heroLabel}>Ask your data</p>
          <h1 className={styles.heroTitle}>What do you want to know?</h1>
        </div>
      )}

      {/* Input Box */}
      <div className={styles.inputBox}>
        <div className={styles.inputArea}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about your database..."
            disabled={loading}
            className={styles.textarea}
            rows={1}
            id="chat-input"
          />
        </div>
        <div className={styles.inputToolbar}>
          <div className={styles.toolbarLeft}>
            <button className={styles.toolButton} type="button" id="attach-btn" title="Add context">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
            <button className={`${styles.toolButton} ${styles.toolButtonLabel}`} type="button" id="model-btn">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
              </svg>
              SQL Agent
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
          </div>
          <div className={styles.toolbarRight}>
            <button
              type="button"
              className={`${styles.sendButton} ${hasInput && !loading ? styles.sendButtonActive : ''}`}
              onClick={() => handleSubmit()}
              disabled={!hasInput || loading}
              id="send-btn"
              aria-label="Send message"
            >
              {loading ? (
                <span className={styles.loadingDots}>
                  <span/><span/><span/>
                </span>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className={styles.error} id="error-message">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      {/* Suggestion Cards — only on empty state */}
      {isEmpty && (
        <div className={styles.suggestions}>
          {SUGGESTED_QUERIES.map((query, i) => (
            <button
              key={i}
              className={styles.suggestionCard}
              onClick={() => handleSuggestion(query)}
              id={`suggestion-${i}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={styles.suggestionIcon}>
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <span>{query}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
