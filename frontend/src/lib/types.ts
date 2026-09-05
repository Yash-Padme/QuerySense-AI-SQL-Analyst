// API Request/Response Types
export interface ChatRequest {
  message: string
  session_id: string
  user_email?: string
}

export interface ChatResponse {
  response: string
}

export interface DatabaseSchema {
  [key: string]: any
}

export interface Chat {
  id: string
  message: string
  response: string
  timestamp: Date
}

export interface ChatHistoryMessage {
  id: string
  sender: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface UserChatSession {
  session_id: string
  title: string
  created_at: string
  updated_at: string
  messages: ChatHistoryMessage[]
}



// lib/types.ts

export interface DynamicKPI {
  label: string
  value: string
}

export interface DynamicChartDataPoint {
  label: string
  value: number
}

export interface DynamicChart {
  title: string
  type: 'bar' | 'area'
  data: DynamicChartDataPoint[]
}

export interface DynamicInsightsResponse {
  summary: string
  kpis: DynamicKPI[]
  charts: DynamicChart[]
}
