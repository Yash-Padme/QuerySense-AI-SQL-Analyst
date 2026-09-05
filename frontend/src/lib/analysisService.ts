import apiClient from './api'
import {
  ChatRequest,
  ChatResponse,
  DatabaseSchema,
  UserChatSession,
  DynamicInsightsResponse,
} from './types'

export const analysisService = {
  /**
   * Send a chat message to the AI analyst with user_email for user-wise persistence
   */
  async chat(message: string, sessionId: string, userEmail?: string): Promise<string> {
    try {
      const payload: ChatRequest = {
        message,
        session_id: sessionId,
        user_email: userEmail || 'guest',
      }
      const response = await apiClient.post<ChatResponse>('/analyst/chat', payload)
      return response.data.response
    } catch (error) {
      console.error('Error calling analyst chat:', error)
      throw error
    }
  },

  /**
   * Fetch database chat history for a specific user_email
   */
  async getUserHistory(userEmail: string): Promise<UserChatSession[]> {
    try {
      const response = await apiClient.get<UserChatSession[]>('/analyst/history', {
        params: { user_email: userEmail },
      })
      return response.data
    } catch (error) {
      console.error('Error fetching user chat history:', error)
      return []
    }
  },

  /**
   * Delete a chat session for a specific user_email
   */
  async deleteUserSession(sessionId: string, userEmail: string): Promise<void> {
    try {
      await apiClient.delete(`/analyst/history/${sessionId}`, {
        params: { user_email: userEmail },
      })
    } catch (error) {
      console.error('Error deleting user chat session:', error)
    }
  },

  /**
   * Fetch the database schema
   */
  async getSchema(): Promise<DatabaseSchema> {
    try {
      const response = await apiClient.get<DatabaseSchema>('/analyst/schema')
      return response.data
    } catch (error) {
      console.error('Error fetching schema:', error)
      throw error
    }
  },

  /**
   * Fetch AI-Powered Dynamic BI Insights & Charts for the connected database
   */
  async getInsights(): Promise<DynamicInsightsResponse> {
    try {
      const response = await apiClient.get<DynamicInsightsResponse>('/analyst/insights')
      return response.data
    } catch (error) {
      console.error('Error fetching dynamic insights:', error)
      throw error
    }
  },

  /**
   * Check if backend is online
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await apiClient.get('/analyst/schema')
      return response.status === 200
    } catch (error) {
      console.error('Backend health check failed:', error)
      return false
    }
  },


  
}