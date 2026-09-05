'use client'

import React, { useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { analysisService } from '@/lib/analysisService'
import { DynamicInsightsResponse } from '@/lib/types' // 👈 Import from types
import styles from './InsightsModal.module.css'

interface InsightsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const InsightsModal = ({ isOpen, onClose }: InsightsModalProps) => {
  const [data, setData] = useState<DynamicInsightsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      setError(null)
      analysisService
        .getInsights()
        .then((res) => setData(res))
        .catch((err) => {
          console.error(err)
          setError('Error: Failed to generate AI Insights due to a database connectivity issue.')
        })
        .finally(() => setLoading(false))
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2">
              <path d="M18 20V10M12 20V4M6 20v-6" />
            </svg>
            <h3>AI-Powered Dynamic BI Dashboard</h3>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <p>LLM active schema analyze karke dynamic BI queries run kar raha hai...</p>
          </div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : data ? (
          <div className={styles.body}>
            {/* AI Summary Banner */}
            {data.summary && (
              <div className={styles.summaryBanner}>
                <span className={styles.aiTag}>AI Summary</span>
                <p>{data.summary}</p>
              </div>
            )}

            {/* Dynamic KPI Cards */}
            <div className={styles.kpiGrid}>
              {data.kpis.map((kpi, idx) => (
                <div key={idx} className={styles.kpiCard}>
                  <span className={styles.kpiLabel}>{kpi.label}</span>
                  <span className={styles.kpiValue}>{kpi.value}</span>
                </div>
              ))}
            </div>

            {/* Dynamic Charts Grid */}
            <div className={styles.chartsGrid}>
              {data.charts.map((chart, idx) => (
                <div key={idx} className={styles.chartCard}>
                  <h4>{chart.title}</h4>
                  <div style={{ width: '100%', height: 230 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      {chart.type === 'area' ? (
                        <AreaChart data={chart.data}>
                          <defs>
                            <linearGradient id={`grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                          <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                          <Tooltip
                            contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: 6 }}
                          />
                          <Area type="monotone" dataKey="value" stroke="#10b981" fill={`url(#grad-${idx})`} strokeWidth={2} />
                        </AreaChart>
                      ) : (
                        <BarChart data={chart.data}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                          <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                          <Tooltip
                            contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: 6 }}
                          />
                          <Bar dataKey="value" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}