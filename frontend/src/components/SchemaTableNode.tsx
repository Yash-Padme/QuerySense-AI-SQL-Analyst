// 'use client'

// import React, { memo } from 'react'
// import { Handle, Position } from '@xyflow/react'

// interface Column {
//   name: string
//   type: string
// }

// export const SchemaTableNode = memo(({ data }: { data: { label: string; columns: Column[] } }) => {
//   return (
//     <div
//       style={{
//         background: '#0d1525',
//         border: '1px solid #1e293b',
//         borderRadius: '8px',
//         minWidth: '230px',
//         boxShadow: '0 10px 25px rgba(0, 0, 0, 0.6)',
//         overflow: 'hidden',
//         fontFamily: 'monospace',
//         fontSize: '12px',
//       }}
//     >
//       {/* Node In/Out Connectors */}
//       <Handle
//         type="target"
//         position={Position.Left}
//         style={{ background: '#38bdf8', width: 8, height: 8 }}
//       />
//       <Handle
//         type="source"
//         position={Position.Right}
//         style={{ background: '#818cf8', width: 8, height: 8 }}
//       />

//       {/* Table Header */}
//       <div
//         style={{
//           background: '#0284c7',
//           padding: '8px 12px',
//           fontWeight: 700,
//           color: '#ffffff',
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           letterSpacing: '0.5px',
//         }}
//       >
//         <span>public.{data.label}</span>
//         <span style={{ fontSize: '14px', opacity: 0.8 }}>···</span>
//       </div>

//       {/* Columns List */}
//       <div style={{ background: '#0b1120', padding: '6px 0' }}>
//         {data.columns.map((col, idx) => {
//           const isIdCol = col.name.endsWith('_id') || col.name === 'id'
//           return (
//             <div
//               key={idx}
//               style={{
//                 display: 'flex',
//                 justifyContent: 'space-between',
//                 padding: '4px 12px',
//                 borderBottom:
//                   idx === data.columns.length - 1 ? 'none' : '1px solid #172554',
//               }}
//             >
//               <span
//                 style={{
//                   color: isIdCol ? '#fbbf24' : '#e2e8f0',
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: '4px',
//                 }}
//               >
//                 {isIdCol && <span style={{ fontSize: '11px' }}>🔑</span>}
//                 {col.name}
//               </span>
//               <span style={{ color: '#64748b', fontSize: '11px' }}>{col.type}</span>
//             </div>
//           )
//         })}
//       </div>
//     </div>
//   )
// })

// SchemaTableNode.displayName = 'SchemaTableNode'



'use client'

import React, { memo } from 'react'
import { Handle, Position } from '@xyflow/react'

export const SchemaTableNode = memo(({ data }: { data: any }) => {
  return (
    <div style={{
      background: '#0d1525',
      border: '1px solid #1e293b',
      borderRadius: '8px',
      minWidth: '240px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.7)',
      fontFamily: 'monospace',
      fontSize: '11px',
    }}>
      <Handle type="target" position={Position.Left} style={{ background: '#38bdf8', width: 7, height: 7 }} />
      <Handle type="source" position={Position.Right} style={{ background: '#818cf8', width: 7, height: 7 }} />

      {/* Header */}
      <div style={{
        background: '#1d4ed8',
        padding: '7px 12px',
        fontWeight: 'bold',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        borderTopLeftRadius: '7px',
        borderTopRightRadius: '7px',
      }}>
        <span>public.{data.label}</span>
        <span style={{ opacity: 0.6 }}>•••</span>
      </div>

      {/* Column Rows */}
      <div style={{ padding: '4px 0' }}>
        {data.columns.map((col: any, idx: number) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '4px 10px',
              borderBottom: idx === data.columns.length - 1 ? 'none' : '1px solid #172554',
              gap: '12px'
            }}
          >
            {/* Column Identifier & Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {col.is_pk ? (
                <span title="Primary Key" style={{ color: '#fbbf24', fontSize: '10px' }}>🔑</span>
              ) : (
                <span style={{ opacity: 0.2 }}>•</span>
              )}
              <span style={{ color: col.is_pk ? '#fbbf24' : '#e2e8f0', fontWeight: col.is_pk ? 600 : 400 }}>
                {col.name}
              </span>
            </div>

            {/* Type & NN Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#64748b', fontSize: '10px' }}>{col.type.toLowerCase()}</span>
              {!col.nullable && (
                <span style={{
                  fontSize: '9px',
                  background: '#1e293b',
                  color: '#94a3b8',
                  padding: '1px 3px',
                  borderRadius: '3px'
                }}>
                  NN
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})

SchemaTableNode.displayName = 'SchemaTableNode'