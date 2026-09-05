'use client'

import { useState, useCallback, useEffect } from 'react'
import { analysisService } from './analysisService'
import { DatabaseSchema, Chat, UserChatSession } from './types'
import { v4 as uuidv4 } from 'uuid'

export const useAnalystChat = (userEmail?: string) => {
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState(() => uuidv4())
  const [userSessions, setUserSessions] = useState<UserChatSession[]>([])

  // Fetch database user-wise chat sessions
  const refreshUserHistory = useCallback(async () => {
    if (!userEmail) {
      setUserSessions([])
      return
    }
    try {
      const history = await analysisService.getUserHistory(userEmail)
      setUserSessions(history)
    } catch (err) {
      console.error('Failed to load user history:', err)
    }
  }, [userEmail])

  useEffect(() => {
    refreshUserHistory()
  }, [refreshUserHistory])

  // Send message
  const sendMessage = useCallback(async (message: string, currentEmail?: string) => {
    setLoading(true)
    setError(null)
    const emailToUse = currentEmail || userEmail || 'guest'

    try {
      const response = await analysisService.chat(message, sessionId, emailToUse)
      
      const newChat: Chat = {
        id: uuidv4(),
        message,
        response,
        timestamp: new Date(),
      }

      setChats((prev) => [...prev, newChat])
      
      // Refresh user history list
      if (emailToUse && emailToUse !== 'guest') {
        refreshUserHistory()
      }
      
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [sessionId, userEmail, refreshUserHistory])

  // Select an existing thread from history
  const selectSession = useCallback((targetSessionId: string) => {
    const session = userSessions.find((s) => s.session_id === targetSessionId)
    if (!session) return

    setSessionId(targetSessionId)
    setError(null)

    // Pair up user and assistant messages into Chat items
    const pairedChats: Chat[] = []
    const msgs = session.messages

    for (let i = 0; i < msgs.length; i++) {
      if (msgs[i].sender === 'user') {
        const userMsg = msgs[i]
        const assistantMsg = msgs[i + 1]?.sender === 'assistant' ? msgs[i + 1] : null
        pairedChats.push({
          id: userMsg.id,
          message: userMsg.content,
          response: assistantMsg ? assistantMsg.content : '',
          timestamp: new Date(userMsg.timestamp),
        })
        if (assistantMsg) i++ // Skip assistant msg as paired
      }
    }

    setChats(pairedChats)
  }, [userSessions])

  // Start new thread
  const clearChats = useCallback(() => {
    setChats([])
    setError(null)
    setSessionId(uuidv4())
  }, [])

  // 🗑️ Delete specific chat session from history
  const deleteSession = useCallback(async (targetSessionId: string) => {
    if (!userEmail) return

    try {
      // 1. Backend DELETE API call via analysisService
      await analysisService.deleteUserSession(targetSessionId, userEmail)

      // 2. UI sessions state se remove
      setUserSessions((prev) => prev.filter((s) => s.session_id !== targetSessionId))

      // 3. Agar wahi chat screen par active hai to clear chat view
      if (sessionId === targetSessionId) {
        clearChats()
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete session'
      setError(errorMessage)
      console.error('Failed to delete session:', err)
    }
  }, [userEmail, sessionId, clearChats])

  return {
    chats,
    loading,
    error,
    sessionId,
    userSessions,
    sendMessage,
    selectSession,
    clearChats,
    refreshUserHistory,
    deleteSession, // 👈 Export delete method
  }
}

export const useDatabaseSchema = () => {
  const [schema, setSchema] = useState<DatabaseSchema | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSchema = async () => {
      try {
        setLoading(true)
        const data = await analysisService.getSchema()
        setSchema(data)
        setError(null)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch schema'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchSchema()
  }, [])

  return { schema, loading, error }
}

export const useBackendHealth = () => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        setLoading(true)
        const online = await analysisService.checkHealth()
        setIsOnline(online)
      } catch (err) {
        setIsOnline(false)
      } finally {
        setLoading(false)
      }
    }

    checkHealth()
  }, [])

  return { isOnline, loading }
}