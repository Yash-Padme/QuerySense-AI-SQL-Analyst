


'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import apiClient from '@/lib/api'
import styles from './SchemaModal.module.css'
import { SchemaTableNode } from './SchemaTableNode'

interface Column {
  name: string
  type: string
  is_pk?: boolean
  nullable?: boolean
}

interface Relationship {
  id: string
  source: string
  target: string
  source_col?: string
  target_col?: string
}

interface SchemaModalProps {
  isOpen: boolean
  onClose: () => void
}

export const SchemaModal = ({ isOpen, onClose }: SchemaModalProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const nodeTypes = useMemo(() => ({ tableNode: SchemaTableNode }), [])

  useEffect(() => {
    if (!isOpen) return

    setLoading(true)
    setError(null)

    apiClient
      .get('/analyst/schema')
      .then((res) => {
        // Support both: 
        // 1. Updated Backend: { tables: {...}, relationships: [...] }
        // 2. Legacy Backend: { schema: {...} } or direct {...}
        const rawTables = res.data?.tables || res.data?.schema || res.data || {}
        const rawEdges: Relationship[] = Array.isArray(res.data?.relationships)
          ? res.data.relationships
          : []

        // Normalize schema data defensively
        const schemaData: Record<string, Column[]> = {}
        Object.entries(rawTables).forEach(([tbl, val]) => {
          if (Array.isArray(val)) {
            schemaData[tbl] = val
          } else if (typeof val === 'object' && val !== null) {
            schemaData[tbl] = Object.entries(val).map(([name, type]) => ({
              name,
              type: String(type),
            }))
          }
        })

        const tableNames = Object.keys(schemaData)

        if (tableNames.length === 0) {
          setError('Koi tables nahi mili.')
          return
        }

        // 1. Arrange nodes in a neat multi-column grid with dynamic row heights
        const columnsCount = 3
        const colWidth = 340
        const colHeights = [40, 40, 40]

        const generatedNodes: Node[] = tableNames.map((tableName, index) => {
          const colIndex = index % columnsCount
          const yPos = colHeights[colIndex]
          
          const colCount = schemaData[tableName]?.length || 3
          // Estimated node card height (header 45px + each column ~30px + padding)
          const nodeHeight = 45 + colCount * 30 + 35
          colHeights[colIndex] += nodeHeight

          return {
            id: tableName,
            type: 'tableNode',
            position: { x: colIndex * colWidth + 40, y: yPos },
            data: { label: tableName, columns: schemaData[tableName] || [] },
          }
        })

        // 2. Generate Edges: Exact foreign keys if backend sent them, else name inference
        const generatedEdges: Edge[] = []

        if (rawEdges.length > 0) {
          rawEdges.forEach((rel) => {
            if (schemaData[rel.source] && schemaData[rel.target]) {
              generatedEdges.push({
                id: rel.id || `edge-${rel.source}-${rel.target}-${rel.source_col}`,
                source: rel.source,
                target: rel.target,
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#38bdf8', strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed, color: '#38bdf8' },
              })
            }
          })
        } else {
          // Fallback inference if backend doesn't provide explicit relationships
          tableNames.forEach((sourceTable) => {
            const cols = schemaData[sourceTable]
            if (Array.isArray(cols)) {
              cols.forEach((col) => {
                if (
                  col &&
                  typeof col.name === 'string' &&
                  col.name.endsWith('_id') &&
                  col.name !== `${sourceTable}_id`
                ) {
                  const targetCandidate = col.name.replace(/_id$/, '')
                  const matchedTarget = tableNames.find(
                    (t) =>
                      t === targetCandidate ||
                      t === `${targetCandidate}s` ||
                      (targetCandidate === 'category' && t === 'categories')
                  )

                  if (matchedTarget && matchedTarget !== sourceTable) {
                    generatedEdges.push({
                      id: `edge-${sourceTable}-${matchedTarget}-${col.name}`,
                      source: sourceTable,
                      target: matchedTarget,
                      type: 'smoothstep',
                      animated: true,
                      style: { stroke: '#38bdf8', strokeWidth: 2 },
                      markerEnd: { type: MarkerType.ArrowClosed, color: '#38bdf8' },
                    })
                  }
                }
              })
            }
          })
        }

        setNodes(generatedNodes)
        setEdges(generatedEdges)
      })
      .catch((err) => {
        console.error('Failed to load schema graph:', err)
        setError('Database schema graph load karne me error aayi.')
      })
      .finally(() => setLoading(false))
  }, [isOpen, setNodes, setEdges])

  // Filter nodes opacity when user types in search box
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const q = e.target.value.toLowerCase()
      setSearchQuery(q)

      setNodes((nds) =>
        nds.map((node) => {
          const tableName = node.id.toLowerCase()
          // const hasColMatch = node.data.columns?.some((c: Column) =>
          //   c.name.toLowerCase().includes(q)
          // )
          // Cast node.data to any to prevent TypeScript from treating it as '{}'
        const nodeData = node.data as { columns?: Column[] }
        const hasColMatch = nodeData.columns?.some((c: Column) =>
          c.name.toLowerCase().includes(q)
        )
          const isMatch = !q || tableName.includes(q) || hasColMatch

          return {
            ...node,
            style: {
              ...node.style,
              opacity: isMatch ? 1 : 0.2,
              transition: 'opacity 0.2s ease',
            },
          }
        })
      )
    },
    [setNodes]
  )

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
            </svg>
            <h3>Database Schema Visualizer</h3>
            <span className={styles.subHint}>• Drag tables to rearrange • Scroll to zoom</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="text"
              placeholder="Search table or column..."
              value={searchQuery}
              onChange={handleSearchChange}
              style={{
                background: '#070b14',
                border: '1px solid #1e293b',
                color: '#e2e8f0',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                outline: 'none',
                width: '180px',
              }}
            />
            <button className={styles.closeBtn} onClick={onClose}>✕</button>
          </div>
        </div>

        <div className={styles.canvasArea}>
          {loading && <div className={styles.loading}>Generating schema graph...</div>}
          {error && <div className={styles.errorMessage}>{error}</div>}

          {!loading && !error && (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.15 }}
            >
              <Background color="#1e293b" gap={24} size={1.2} />
              <Controls style={{ fill: '#e2e8f0', background: '#0f172a', border: '1px solid #1e293b' }} />
              <MiniMap
                nodeColor={() => '#0284c7'}
                maskColor="rgba(15, 23, 42, 0.75)"
                style={{ background: '#0b1120', border: '1px solid #1e293b' }}
              />
            </ReactFlow>
          )}
        </div>
      </div>
    </div>
  )
}




// 'use client'

// import { useEffect, useState } from 'react'
// import apiClient from '@/lib/api'
// import styles from './SchemaModal.module.css'

// interface Column {
//   name: string
//   type: string
// }

// interface SchemaData {
//   [tableName: string]: Column[]
// }

// interface SchemaModalProps {
//   isOpen: boolean
//   onClose: () => void
// }

// export const SchemaModal = ({ isOpen, onClose }: SchemaModalProps) => {
//   const [schema, setSchema] = useState<SchemaData>({})
//   const [loading, setLoading] = useState(false)
//   const [openTable, setOpenTable] = useState<string | null>(null)
//   const [error, setError] = useState<string | null>(null)

//   useEffect(() => {
//     if (isOpen) {
//       setLoading(true)
//       setError(null)
//       // ✅ Base URL has /api/v1, so this calls /api/v1/analyst/schema
//       apiClient
//         .get('/analyst/schema')
//         .then((res) => {
//           const data = res.data || {}
//           setSchema(data)
//           const tables = Object.keys(data)
//           if (tables.length > 0) {
//             setOpenTable(tables[0])
//           }
//         })
//         .catch((err) => {
//           console.error('Failed to load schema:', err)
//           setError('Database schema load karne me problem aayi.')
//         })
//         .finally(() => setLoading(false))
//     }
//   }, [isOpen])

//   if (!isOpen) return null

//   const tableNames = Object.keys(schema)

//   return (
//     <div className={styles.modalOverlay} onClick={onClose}>
//       <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
//         <div className={styles.header}>
//           <div className={styles.titleGroup}>
//             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2">
//               <ellipse cx="12" cy="5" rx="9" ry="3"/>
//               <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
//               <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
//             </svg>
//             <h3>Database Schema Explorer</h3>
//           </div>
//           <button className={styles.closeBtn} onClick={onClose}>✕</button>
//         </div>

//         {loading && <div className={styles.loading}>Loading database tables...</div>}
//         {error && <div className={styles.errorMessage}>{error}</div>}

//         {!loading && !error && tableNames.length === 0 && (
//           <div className={styles.loading}>Koi tables nahi mili.</div>
//         )}

//         {!loading && !error && tableNames.length > 0 && (
//           <div className={styles.tableList}>
//             {tableNames.map((tableName) => {
//               const columns = schema[tableName] || []
//               const isExpanded = openTable === tableName

//               return (
//                 <div key={tableName} className={styles.tableCard}>
//                   <button
//                     type="button"
//                     className={styles.tableHeader}
//                     onClick={() => setOpenTable(isExpanded ? null : tableName)}
//                   >
//                     <div className={styles.tableNameGroup}>
//                       <span className={styles.tableIcon}>{isExpanded ? '📂' : '📁'}</span>
//                       <span className={styles.tableName}>{tableName}</span>
//                     </div>
//                     <span className={styles.colCount}>{columns.length} columns</span>
//                   </button>

//                   {isExpanded && (
//                     <div className={styles.columnList}>
//                       {columns.map((col) => (
//                         <div key={col.name} className={styles.columnRow}>
//                           <span className={styles.colName}>{col.name}</span>
//                           <span className={styles.colType}>{col.type}</span>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               )
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }


// 'use client'

// import React, { useEffect, useState, useMemo } from 'react'
// import {
//   ReactFlow,
//   Background,
//   Controls,
//   MiniMap,
//   Node,
//   Edge,
//   useNodesState,
//   useEdgesState,
//   MarkerType,
// } from '@xyflow/react'
// import '@xyflow/react/dist/style.css'
// import apiClient from '@/lib/api'
// import { SchemaTableNode } from './SchemaTableNode'

// interface Column {
//   name: string
//   type: string
// }

// interface SchemaData {
//   [tableName: string]: Column[]
// }

// interface SchemaModalProps {
//   isOpen: boolean
//   onClose: () => void
// }

// export const SchemaModal = ({ isOpen, onClose }: SchemaModalProps) => {
//   const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
//   const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   const nodeTypes = useMemo(() => ({ tableNode: SchemaTableNode }), [])

//   useEffect(() => {
//     if (!isOpen) return

//     setLoading(true)
//     setError(null)

//     apiClient
//       .get('/analyst/schema')
//       .then((res) => {
//         const schemaData: SchemaData = res.data?.schema || res.data || {}
//         const tableNames = Object.keys(schemaData)

//         if (tableNames.length === 0) {
//           setError('No tables found in database.')
//           return
//         }

//         // 1. Grid layout arrangement for tables
//         const generatedNodes: Node[] = tableNames.map((tableName, index) => {
//           const colIndex = index % 3
//           const rowIndex = Math.floor(index / 3)
//           return {
//             id: tableName,
//             type: 'tableNode',
//             position: { x: colIndex * 340 + 40, y: rowIndex * 280 + 40 },
//             data: { label: tableName, columns: schemaData[tableName] },
//           }
//         })

//         // 2. Auto-detect Foreign Key edges via naming convention (_id matching)
//         const generatedEdges: Edge[] = []
//         tableNames.forEach((sourceTable) => {
//           const cols = schemaData[sourceTable] || []
//           cols.forEach((col) => {
//             if (col.name.endsWith('_id') && col.name !== `${sourceTable}_id`) {
//               const targetCandidate = col.name.replace(/_id$/, '')

//               // Match singular, plural, or exact table names
//               const matchedTarget = tableNames.find(
//                 (t) =>
//                   t === targetCandidate ||
//                   t === `${targetCandidate}s` ||
//                   (targetCandidate === 'category' && t === 'categories')
//               )

//               if (matchedTarget && matchedTarget !== sourceTable) {
//                 generatedEdges.push({
//                   id: `edge-${sourceTable}-${matchedTarget}-${col.name}`,
//                   source: sourceTable,
//                   target: matchedTarget,
//                   type: 'smoothstep',
//                   animated: true,
//                   style: { stroke: '#38bdf8', strokeWidth: 2 },
//                   markerEnd: { type: MarkerType.ArrowClosed, color: '#38bdf8' },
//                 })
//               }
//             }
//           })
//         })

//         setNodes(generatedNodes)
//         setEdges(generatedEdges)
//       })
//       .catch((err) => {
//         console.error('Failed to load schema graph:', err)
//         setError('Database schema graph load karne me problem aayi.')
//       })
//       .finally(() => setLoading(false))
//   }, [isOpen, setNodes, setEdges])

//   if (!isOpen) return null

//   return (
//     <div
//       style={{
//         position: 'fixed',
//         inset: 0,
//         background: 'rgba(0, 0, 0, 0.85)',
//         zIndex: 1200,
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         backdropFilter: 'blur(5px)',
//       }}
//       onClick={onClose}
//     >
//       <div
//         style={{
//           background: '#090d16',
//           border: '1px solid #1e293b',
//           borderRadius: '12px',
//           width: '94vw',
//           height: '88vh',
//           display: 'flex',
//           flexDirection: 'column',
//           overflow: 'hidden',
//           boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)',
//         }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Modal Top Bar */}
//         <div
//           style={{
//             display: 'flex',
//             justifyContent: 'space-between',
//             alignItems: 'center',
//             padding: '14px 20px',
//             borderBottom: '1px solid #1e293b',
//             background: '#0f172a',
//           }}
//         >
//           <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f8fafc' }}>
//             <span style={{ fontSize: '18px' }}>🗄️</span>
//             <span style={{ fontWeight: 600, fontSize: '15px' }}>Database Schema Visualizer</span>
//             <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '10px' }}>
//               • Drag tables to rearrange • Scroll to zoom in/out
//             </span>
//           </div>
//           <button
//             onClick={onClose}
//             style={{
//               background: 'transparent',
//               border: 'none',
//               color: '#94a3b8',
//               fontSize: '18px',
//               cursor: 'pointer',
//             }}
//           >
//             ✕
//           </button>
//         </div>

//         {/* Canvas Graph Viewport */}
//         <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
//           {loading && (
//             <div
//               style={{
//                 display: 'flex',
//                 height: '100%',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 color: '#94a3b8',
//               }}
//             >
//               Generating interactive schema graph...
//             </div>
//           )}

//           {error && (
//             <div
//               style={{
//                 display: 'flex',
//                 height: '100%',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 color: '#f87171',
//               }}
//             >
//               {error}
//             </div>
//           )}

//           {!loading && !error && (
//             <ReactFlow
//               nodes={nodes}
//               edges={edges}
//               onNodesChange={onNodesChange}
//               onEdgesChange={onEdgesChange}
//               nodeTypes={nodeTypes}
//               fitView
//             >
//               <Background color="#1e293b" gap={24} size={1.2} />
//               <Controls style={{ fill: '#e2e8f0', background: '#0f172a', border: '1px solid #1e293b' }} />
//               <MiniMap
//                 nodeColor={() => '#0284c7'}
//                 maskColor="rgba(15, 23, 42, 0.75)"
//                 style={{ background: '#0b1120', border: '1px solid #1e293b' }}
//               />
//             </ReactFlow>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }


// 'use client'

// import React, { useEffect, useState, useMemo } from 'react'
// import {
//   ReactFlow,
//   Background,
//   Controls,
//   MiniMap,
//   Node,
//   Edge,
//   useNodesState,
//   useEdgesState,
//   MarkerType,
//   Handle,
//   Position,
// } from '@xyflow/react'
// import '@xyflow/react/dist/style.css'
// import apiClient from '@/lib/api'
// import styles from './SchemaModal.module.css'

// interface Column {
//   name: string
//   type: string
// }

// interface SchemaData {
//   [tableName: string]: Column[]
// }

// interface SchemaModalProps {
//   isOpen: boolean
//   onClose: () => void
// }

// // Custom Table Node matching diagram sample
// const SchemaTableNode = ({ data }: { data: { label: string; columns: Column[] } }) => {
//   return (
//     <div className={styles.tableNode}>
//       <Handle type="target" position={Position.Left} style={{ background: '#38bdf8', width: 8, height: 8 }} />
//       <Handle type="source" position={Position.Right} style={{ background: '#818cf8', width: 8, height: 8 }} />

//       <div className={styles.tableNodeHeader}>
//         <span>public.{data.label}</span>
//         <span style={{ fontSize: '13px', opacity: 0.7 }}>···</span>
//       </div>

//       <div className={styles.tableNodeBody}>
//         {data.columns.map((col, idx) => {
//           const isPk = col.name.endsWith('_id') || col.name === 'id'
//           return (
//             <div key={idx} className={styles.tableNodeRow}>
//               <span className={`${styles.colName} ${isPk ? styles.pkColName : ''}`}>
//                 {isPk && <span>🔑</span>}
//                 {col.name}
//               </span>
//               <span className={styles.colType}>{col.type}</span>
//             </div>
//           )
//         })}
//       </div>
//     </div>
//   )
// }

// export const SchemaModal = ({ isOpen, onClose }: SchemaModalProps) => {
//   const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
//   const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   const nodeTypes = useMemo(() => ({ tableNode: SchemaTableNode }), [])

//   useEffect(() => {
//     if (!isOpen) return

//     setLoading(true)
//     setError(null)

//     // Base URL /api/v1 -> /analyst/schema
//     apiClient
//       .get('/analyst/schema')
//       .then((res) => {
//         const schemaData: SchemaData = res.data?.schema || res.data || {}
//         const tableNames = Object.keys(schemaData)

//         if (tableNames.length === 0) {
//           setError('Database me tables nahi mili.')
//           return
//         }

//         // Layout positioning (3 columns grid)
//         const generatedNodes: Node[] = tableNames.map((tableName, index) => {
//           const colIndex = index % 3
//           const rowIndex = Math.floor(index / 3)
//           return {
//             id: tableName,
//             type: 'tableNode',
//             position: { x: colIndex * 360 + 40, y: rowIndex * 300 + 40 },
//             data: { label: tableName, columns: schemaData[tableName] || [] },
//           }
//         })

//         // Foreign Key lines based on _id naming conventions
//         const generatedEdges: Edge[] = []
//         tableNames.forEach((sourceTable) => {
//           const cols = schemaData[sourceTable] || []
//           cols.forEach((col) => {
//             if (col.name.endsWith('_id') && col.name !== `${sourceTable}_id`) {
//               const targetCandidate = col.name.replace(/_id$/, '')
//               const matchedTarget = tableNames.find(
//                 (t) =>
//                   t === targetCandidate ||
//                   t === `${targetCandidate}s` ||
//                   (targetCandidate === 'category' && t === 'categories')
//               )

//               if (matchedTarget && matchedTarget !== sourceTable) {
//                 generatedEdges.push({
//                   id: `edge-${sourceTable}-${matchedTarget}-${col.name}`,
//                   source: sourceTable,
//                   target: matchedTarget,
//                   type: 'smoothstep',
//                   animated: true,
//                   style: { stroke: '#38bdf8', strokeWidth: 2 },
//                   markerEnd: { type: MarkerType.ArrowClosed, color: '#38bdf8' },
//                 })
//               }
//             }
//           })
//         })

//         setNodes(generatedNodes)
//         setEdges(generatedEdges)
//       })
//       .catch((err) => {
//         console.error('Failed to load schema graph:', err)
//         setError('Database schema graph load karne me error aayi.')
//       })
//       .finally(() => setLoading(false))
//   }, [isOpen, setNodes, setEdges])

//   if (!isOpen) return null

//   return (
//     <div className={styles.modalOverlay} onClick={onClose}>
//       <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
//         <div className={styles.header}>
//           <div className={styles.titleGroup}>
//             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2">
//               <ellipse cx="12" cy="5" rx="9" ry="3" />
//               <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
//               <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
//             </svg>
//             <h3>Database Schema Visualizer</h3>
//             <span className={styles.subHint}>• Drag tables to rearrange • Scroll to zoom</span>
//           </div>
//           <button className={styles.closeBtn} onClick={onClose}>✕</button>
//         </div>

//         <div className={styles.canvasArea}>
//           {loading && <div className={styles.loading}>Generating schema graph...</div>}
//           {error && <div className={styles.errorMessage}>{error}</div>}

//           {!loading && !error && (
//             <ReactFlow
//               nodes={nodes}
//               edges={edges}
//               onNodesChange={onNodesChange}
//               onEdgesChange={onEdgesChange}
//               nodeTypes={nodeTypes}
//               fitView
//             >
//               <Background color="#1e293b" gap={24} size={1.2} />
//               <Controls style={{ fill: '#e2e8f0', background: '#0f172a', border: '1px solid #1e293b' }} />
//               <MiniMap
//                 nodeColor={() => '#0284c7'}
//                 maskColor="rgba(15, 23, 42, 0.75)"
//                 style={{ background: '#0b1120', border: '1px solid #1e293b' }}
//               />
//             </ReactFlow>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }


// 'use client'

// import React, { useEffect, useState, useMemo } from 'react'
// import {
//   ReactFlow,
//   Background,
//   Controls,
//   MiniMap,
//   Node,
//   Edge,
//   useNodesState,
//   useEdgesState,
//   MarkerType,
// } from '@xyflow/react'
// import '@xyflow/react/dist/style.css'
// import apiClient from '@/lib/api'
// import styles from './SchemaModal.module.css'
// import { SchemaTableNode } from './SchemaTableNode'

// interface Column {
//   name: string
//   type: string
// }

// interface SchemaModalProps {
//   isOpen: boolean
//   onClose: () => void
// }

// export const SchemaModal = ({ isOpen, onClose }: SchemaModalProps) => {
//   const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
//   const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   const nodeTypes = useMemo(() => ({ tableNode: SchemaTableNode }), [])

//   useEffect(() => {
//     if (!isOpen) return

//     setLoading(true)
//     setError(null)

//     apiClient
//       .get('/analyst/schema')
//       .then((res) => {
//         // Backend se chahe res.data.schema aaye ya res.data direct aaye[cite: 2]
//         const rawData = res.data?.schema || res.data || {}
        
//         // Normalize schema data: ensure har table ki value array hi ho
//         const schemaData: Record<string, Column[]> = {}
//         Object.entries(rawData).forEach(([tbl, val]) => {
//           if (Array.isArray(val)) {
//             schemaData[tbl] = val
//           } else if (typeof val === 'object' && val !== null) {
//             // Agar backend se { "colName": "colType" } object aa raha ho
//             schemaData[tbl] = Object.entries(val).map(([name, type]) => ({
//               name,
//               type: String(type),
//             }))
//           }
//         })

//         const tableNames = Object.keys(schemaData)

//         if (tableNames.length === 0) {
//           setError('Koi tables nahi mili.')
//           return
//         }

//         // 1. Arrange nodes in a 3-column grid
//         const generatedNodes: Node[] = tableNames.map((tableName, index) => {
//           const colIndex = index % 3
//           const rowIndex = Math.floor(index / 3)
//           return {
//             id: tableName,
//             type: 'tableNode',
//             position: { x: colIndex * 340 + 40, y: rowIndex * 280 + 40 },
//             data: { label: tableName, columns: schemaData[tableName] || [] },
//           }
//         })

//         // 2. Safe Foreign Key connection generation
//         const generatedEdges: Edge[] = []
//         tableNames.forEach((sourceTable) => {
//           const cols = schemaData[sourceTable]

//           // ✅ Fix: Check ensure karta hai ki cols hamesha array ho tabhi loop chale
//           if (Array.isArray(cols)) {
//             cols.forEach((col) => {
//               if (col && typeof col.name === 'string' && col.name.endsWith('_id') && col.name !== `${sourceTable}_id`) {
//                 const targetCandidate = col.name.replace(/_id$/, '')

//                 const matchedTarget = tableNames.find(
//                   (t) =>
//                     t === targetCandidate ||
//                     t === `${targetCandidate}s` ||
//                     (targetCandidate === 'category' && t === 'categories')
//                 )

//                 if (matchedTarget && matchedTarget !== sourceTable) {
//                   generatedEdges.push({
//                     id: `edge-${sourceTable}-${matchedTarget}-${col.name}`,
//                     source: sourceTable,
//                     target: matchedTarget,
//                     type: 'smoothstep',
//                     animated: true,
//                     style: { stroke: '#38bdf8', strokeWidth: 2 },
//                     markerEnd: { type: MarkerType.ArrowClosed, color: '#38bdf8' },
//                   })
//                 }
//               }
//             })
//           }
//         })

//         setNodes(generatedNodes)
//         setEdges(generatedEdges)
//       })
//       .catch((err) => {
//         console.error('Failed to load schema graph:', err)
//         setError('Database schema graph load karne me error aayi.')
//       })
//       .finally(() => setLoading(false))
//   }, [isOpen, setNodes, setEdges])

//   if (!isOpen) return null

//   return (
//     <div className={styles.modalOverlay} onClick={onClose}>
//       <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
//         <div className={styles.header}>
//           <div className={styles.titleGroup}>
//             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2">
//               <ellipse cx="12" cy="5" rx="9" ry="3" />
//               <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
//               <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
//             </svg>
//             <h3>Database Schema Visualizer</h3>
//             <span className={styles.subHint}>• Drag tables to rearrange • Scroll to zoom</span>
//           </div>
//           <button className={styles.closeBtn} onClick={onClose}>✕</button>
//         </div>

//         <div className={styles.canvasArea}>
//           {loading && <div className={styles.loading}>Generating schema graph...</div>}
//           {error && <div className={styles.errorMessage}>{error}</div>}

//           {!loading && !error && (
//             <ReactFlow
//               nodes={nodes}
//               edges={edges}
//               onNodesChange={onNodesChange}
//               onEdgesChange={onEdgesChange}
//               nodeTypes={nodeTypes}
//               fitView
//             >
//               <Background color="#1e293b" gap={24} size={1.2} />
//               <Controls style={{ fill: '#e2e8f0', background: '#0f172a', border: '1px solid #1e293b' }} />
//               <MiniMap
//                 nodeColor={() => '#0284c7'}
//                 maskColor="rgba(15, 23, 42, 0.75)"
//                 style={{ background: '#0b1120', border: '1px solid #1e293b' }}
//               />
//             </ReactFlow>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }





