// 'use client'

// import { useState, useRef, useEffect } from 'react'
// import { useAnalystChat } from '@/lib/hooks'
// import { ChatInterface } from '@/components/ChatInterface'
// import { ChatMessage } from '@/components/ChatMessage'
// import { Sidebar } from '@/components/Sidebar'
// import { LoginModal } from '@/components/LoginModal'
// import styles from './page.module.css'

// export default function Home() {
//   const [user, setUser] = useState<{ email: string } | null>(() => {
//     if (typeof window !== 'undefined') {
//       const saved = localStorage.getItem('sql_analyst_user')
//       return saved ? JSON.parse(saved) : null
//     }
//     return null
//   })

//   const { chats, loading, error, sendMessage, clearChats, userSessions, selectSession } = useAnalystChat(user?.email)
//   const messagesEndRef = useRef<HTMLDivElement>(null)

//   const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
//   const [hasPromptedLogin, setHasPromptedLogin] = useState(false)

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
//   }

//   useEffect(() => {
//     if (chats.length > 0) {
//       scrollToBottom()
//     }
//   }, [chats])

//   // Trigger login modal automatically on 3rd query if not logged in
//   useEffect(() => {
//     if (chats.length >= 3 && !user && !hasPromptedLogin) {
//       setIsLoginModalOpen(true)
//       setHasPromptedLogin(true)
//     }
//   }, [chats.length, user, hasPromptedLogin])

//   const handleLoginSuccess = (email: string) => {
//     const userData = { email }
//     setUser(userData)
//     if (typeof window !== 'undefined') {
//       localStorage.setItem('sql_analyst_user', JSON.stringify(userData))
//     }
//   }

//   const handleLogout = () => {
//     setUser(null)
//     setHasPromptedLogin(false)
//     if (typeof window !== 'undefined') {
//       localStorage.removeItem('sql_analyst_user')
//     }
//     clearChats()
//   }

//   const isEmpty = chats.length === 0

//   const sidebarHistory = chats.map((c) => ({
//     id: c.id,
//     message: c.message,
//     timestamp: c.timestamp,
//   }))

//   return (
//     <div className={styles.layout}>
//       {/* Sidebar */}
//       <Sidebar
//         chatHistory={sidebarHistory}
//         userSessions={userSessions}
//         onNewChat={clearChats}
//         onSelectChat={selectSession}
//         user={user}
//         onOpenLogin={() => setIsLoginModalOpen(true)}
//         onLogout={handleLogout}
//       />

//       {/* Main Area */}
//       <main className={styles.main}>
//         {/* Top bar */}
//         <header className={styles.topBar}>
//           <div className={styles.topBarLeft}>
//             {!isEmpty && (
//               <h2 className={styles.threadTitle}>
//                 {chats[0]?.message.slice(0, 50)}{chats[0]?.message.length > 50 ? '...' : ''}
//               </h2>
//             )}
//           </div>
//           <div className={styles.topBarRight}>
//             {!user && chats.length >= 3 && (
//               <button
//                 className={styles.loginBannerBtn}
//                 onClick={() => setIsLoginModalOpen(true)}
//                 id="header-login-prompt-btn"
//               >
//                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                   <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
//                 </svg>
//                 Sign In to Save History
//               </button>
//             )}

//             {!isEmpty && (
//               <button onClick={clearChats} className={styles.newThreadBtn} id="clear-btn">
//                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
//                   <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
//                 </svg>
//                 New thread
//               </button>
//             )}
//           </div>
//         </header>

//         {/* Scrollable content */}
//         <div className={`${styles.content} ${isEmpty ? styles.contentCentered : styles.contentScrollable}`}>
//           {/* Chat messages */}
//           {!isEmpty && (
//             <div className={styles.messages}>
//               <div className={styles.messagesInner}>
//                 {chats.map((chat) => (
//                   <ChatMessage
//                     key={chat.id}
//                     message={chat.message}
//                     response={chat.response}
//                     timestamp={chat.timestamp}
//                   />
//                 ))}
//                 {loading && (
//                   <ChatMessage
//                     key="loading"
//                     message=""
//                     response=""
//                     timestamp={new Date()}
//                     isLoading
//                   />
//                 )}
//                 <div ref={messagesEndRef} />
//               </div>
//             </div>
//           )}

//           {/* Input area */}
//           <div className={`${styles.inputWrapper} ${isEmpty ? styles.inputWrapperCentered : styles.inputWrapperBottom}`}>
//             <ChatInterface
//               onSendMessage={async (msg) => { await sendMessage(msg) }}
//               loading={loading}
//               error={error}
//               isEmpty={isEmpty}
//             />
//             {!isEmpty && (
//               <p className={styles.disclaimer}>
//                 SQL Analyst can make mistakes. Verify important queries before running.
//               </p>
//             )}
//           </div>
//         </div>
//       </main>

//       {/* Login Modal */}
//       <LoginModal
//         isOpen={isLoginModalOpen}
//         onClose={() => setIsLoginModalOpen(false)}
//         onLoginSuccess={handleLoginSuccess}
//         queryCount={chats.length}
//       />
//     </div>
//   )
// }




// 'use client'

// import { useState, useRef, useEffect } from 'react'
// import { useAnalystChat } from '@/lib/hooks'
// import { ChatInterface } from '@/components/ChatInterface'
// import { ChatMessage } from '@/components/ChatMessage'
// import { Sidebar } from '@/components/Sidebar'
// import { LoginModal } from '@/components/LoginModal'
// import { SchemaModal } from '@/components/SchemaModal' // 👈 1. Import SchemaModal
// import styles from './page.module.css'

// export default function Home() {
//   const [user, setUser] = useState<{ email: string } | null>(() => {
//     if (typeof window !== 'undefined') {
//       const saved = localStorage.getItem('sql_analyst_user')
//       return saved ? JSON.parse(saved) : null
//     }
//     return null
//   })

//   const { chats, loading, error, sendMessage, clearChats, userSessions, selectSession } = useAnalystChat(user?.email)
//   const messagesEndRef = useRef<HTMLDivElement>(null)

//   const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
//   const [hasPromptedLogin, setHasPromptedLogin] = useState(false)
//   const [isSchemaOpen, setIsSchemaOpen] = useState(false) // 👈 State ready hai

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
//   }

//   useEffect(() => {
//     if (chats.length > 0) {
//       scrollToBottom()
//     }
//   }, [chats])

//   // Trigger login modal automatically on 3rd query if not logged in
//   useEffect(() => {
//     if (chats.length >= 3 && !user && !hasPromptedLogin) {
//       setIsLoginModalOpen(true)
//       setHasPromptedLogin(true)
//     }
//   }, [chats.length, user, hasPromptedLogin])

//   const handleLoginSuccess = (email: string) => {
//     const userData = { email }
//     setUser(userData)
//     if (typeof window !== 'undefined') {
//       localStorage.setItem('sql_analyst_user', JSON.stringify(userData))
//     }
//   }

//   const handleLogout = () => {
//     setUser(null)
//     setHasPromptedLogin(false)
//     if (typeof window !== 'undefined') {
//       localStorage.removeItem('sql_analyst_user')
//     }
//     clearChats()
//   }

//   const isEmpty = chats.length === 0

//   const sidebarHistory = chats.map((c) => ({
//     id: c.id,
//     message: c.message,
//     timestamp: c.timestamp,
//   }))

  

//   return (
//     <div className={styles.layout}>
//       {/* Sidebar */}
//       <Sidebar
//         chatHistory={sidebarHistory}
//         userSessions={userSessions}
//         onNewChat={clearChats}
//         onSelectChat={selectSession}
//         onOpenDatabase={() => setIsSchemaOpen(true)}
//         user={user}
//         onOpenLogin={() => setIsLoginModalOpen(true)}
//         onLogout={handleLogout}
//       />

//       {/* Main Area */}
//       <main className={styles.main}>
//         {/* Top bar */}
//         <header className={styles.topBar}>
//           <div className={styles.topBarLeft}>
//             {!isEmpty && (
//               <h2 className={styles.threadTitle}>
//                 {chats[0]?.message.slice(0, 50)}{chats[0]?.message.length > 50 ? '...' : ''}
//               </h2>
//             )}
//           </div>
//           <div className={styles.topBarRight}>
//             {!user && chats.length >= 3 && (
//               <button
//                 className={styles.loginBannerBtn}
//                 onClick={() => setIsLoginModalOpen(true)}
//                 id="header-login-prompt-btn"
//               >
//                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                   <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
//                 </svg>
//                 Sign In to Save History
//               </button>
//             )}

//             {!isEmpty && (
//               <button onClick={clearChats} className={styles.newThreadBtn} id="clear-btn">
//                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
//                   <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
//                 </svg>
//                 New thread
//               </button>
//             )}
//           </div>
//         </header>

//         {/* Scrollable content */}
//         <div className={`${styles.content} ${isEmpty ? styles.contentCentered : styles.contentScrollable}`}>
//           {/* Chat messages */}
//           {!isEmpty && (
//             <div className={styles.messages}>
//               <div className={styles.messagesInner}>
//                 {chats.map((chat) => (
//                   <ChatMessage
//                     key={chat.id}
//                     message={chat.message}
//                     response={chat.response}
//                     timestamp={chat.timestamp}
//                   />
//                 ))}
//                 {loading && (
//                   <ChatMessage
//                     key="loading"
//                     message=""
//                     response=""
//                     timestamp={new Date()}
//                     isLoading
//                   />
//                 )}
//                 <div ref={messagesEndRef} />
//               </div>
//             </div>
//           )}

//           {/* Input area */}
//           <div className={`${styles.inputWrapper} ${isEmpty ? styles.inputWrapperCentered : styles.inputWrapperBottom}`}>
//             <ChatInterface
//               onSendMessage={async (msg) => { await sendMessage(msg) }}
//               loading={loading}
//               error={error}
//               isEmpty={isEmpty}
//             />
//             {!isEmpty && (
//               <p className={styles.disclaimer}>
//                 SQL Analyst can make mistakes. Verify important queries before running.
//               </p>
//             )}
//           </div>
//         </div>
//       </main>

//       {/* Login Modal */}
//       <LoginModal
//         isOpen={isLoginModalOpen}
//         onClose={() => setIsLoginModalOpen(false)}
//         onLoginSuccess={handleLoginSuccess}
//         queryCount={chats.length}
//       />

//       {/* 👈 2. Render Database Schema Modal */}
//       <SchemaModal
//         isOpen={isSchemaOpen}
//         onClose={() => setIsSchemaOpen(false)}
//       />

      


//     </div>
//   )
// }




// 'use client'

// import { useState, useRef, useEffect } from 'react'
// import { useAnalystChat } from '@/lib/hooks'
// import { ChatInterface } from '@/components/ChatInterface'
// import { ChatMessage } from '@/components/ChatMessage'
// import { Sidebar } from '@/components/Sidebar'
// import { LoginModal } from '@/components/LoginModal'
// import { SchemaModal } from '@/components/SchemaModal'
// // import { HistoryModal } from '@/components/HistoryModal'

// import { InsightsModal } from '@/components/InsightsModal'

// import styles from './page.module.css'

// export default function Home() {
//   const [user, setUser] = useState<{ email: string } | null>(() => {
//     if (typeof window !== 'undefined') {
//       const saved = localStorage.getItem('sql_analyst_user')
//       return saved ? JSON.parse(saved) : null
//     }
//     return null
//   })

  

//   const {
//     chats,
//     loading,
//     error,
//     sendMessage,
//     clearChats,
//     userSessions,
//     selectSession,
//     deleteSession,
//   } = useAnalystChat(user?.email)

//   const messagesEndRef = useRef<HTMLDivElement>(null)

//   const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
//   const [hasPromptedLogin, setHasPromptedLogin] = useState(false)
//   const [isSchemaOpen, setIsSchemaOpen] = useState(false)
//   const [isHistoryOpen, setIsHistoryOpen] = useState(false)

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
//   }

//   useEffect(() => {
//     if (chats.length > 0) {
//       scrollToBottom()
//     }
//   }, [chats])

//   // Trigger login modal automatically on 3rd query if not logged in
//   useEffect(() => {
//     if (chats.length >= 3 && !user && !hasPromptedLogin) {
//       setIsLoginModalOpen(true)
//       setHasPromptedLogin(true)
//     }
//   }, [chats.length, user, hasPromptedLogin])

//   const handleLoginSuccess = (email: string) => {
//     const userData = { email }
//     setUser(userData)
//     if (typeof window !== 'undefined') {
//       localStorage.setItem('sql_analyst_user', JSON.stringify(userData))
//     }
//   }

//   const handleLogout = () => {
//     setUser(null)
//     setHasPromptedLogin(false)
//     if (typeof window !== 'undefined') {
//       localStorage.removeItem('sql_analyst_user')
//     }
//     clearChats()
//   }

//   const isEmpty = chats.length === 0

//   const sidebarHistory = chats.map((c) => ({
//     id: c.id,
//     message: c.message,
//     timestamp: c.timestamp,
//   }))


//   const [isInsightsOpen, setIsInsightsOpen] = useState(false)

//   return (
//     <div className={styles.layout}>
//       {/* Sidebar */}
//       <Sidebar
//         chatHistory={sidebarHistory}
//         userSessions={userSessions}
//         onNewChat={clearChats}
//         onSelectChat={selectSession}
//         onDeleteSession={deleteSession}
//         onOpenDatabase={() => setIsSchemaOpen(true)}

//         onOpenInsights={() => setIsInsightsOpen(true)} // 👈 Open Dynamic Insights

//         // onToggleHistory={() => {
//         //   if (!user) {
//         //     setIsLoginModalOpen(true)
//         //   } else {
//         //     setIsHistoryOpen(true)
//         //   }
//         // }}
//         user={user}
//         onOpenLogin={() => setIsLoginModalOpen(true)}
//         onLogout={handleLogout}
//       />

//       {/* Main Area */}
//       <main className={styles.main}>
//         {/* Top bar */}
//         <header className={styles.topBar}>
//           <div className={styles.topBarLeft}>
//             {!isEmpty && (
//               <h2 className={styles.threadTitle}>
//                 {chats[0]?.message.slice(0, 50)}
//                 {chats[0]?.message.length > 50 ? '...' : ''}
//               </h2>
//             )}
//           </div>
//           <div className={styles.topBarRight}>
//             {!user && chats.length >= 3 && (
//               <button
//                 className={styles.loginBannerBtn}
//                 onClick={() => setIsLoginModalOpen(true)}
//                 id="header-login-prompt-btn"
//               >
//                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                   <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
//                 </svg>
//                 Sign In to Save History
//               </button>
//             )}

//             {!isEmpty && (
//               <button onClick={clearChats} className={styles.newThreadBtn} id="clear-btn">
//                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
//                   <line x1="12" y1="5" x2="12" y2="19" />
//                   <line x1="5" y1="12" x2="19" y2="12" />
//                 </svg>
//                 New thread
//               </button>
//             )}
//           </div>
//         </header>

//         {/* Scrollable content */}
//         <div className={`${styles.content} ${isEmpty ? styles.contentCentered : styles.contentScrollable}`}>
//           {/* Chat messages */}
//           {!isEmpty && (
//             <div className={styles.messages}>
//               <div className={styles.messagesInner}>
//                 {chats.map((chat) => (
//                   <ChatMessage
//                     key={chat.id}
//                     message={chat.message}
//                     response={chat.response}
//                     timestamp={chat.timestamp}
//                   />
//                 ))}
//                 {loading && (
//                   <ChatMessage
//                     key="loading"
//                     message=""
//                     response=""
//                     timestamp={new Date()}
//                     isLoading
//                   />
//                 )}
//                 <div ref={messagesEndRef} />
//               </div>
//             </div>
//           )}

//           {/* Input area */}
//           <div className={`${styles.inputWrapper} ${isEmpty ? styles.inputWrapperCentered : styles.inputWrapperBottom}`}>
//             <ChatInterface
//               onSendMessage={async (msg) => {
//                 await sendMessage(msg)
//               }}
//               loading={loading}
//               error={error}
//               isEmpty={isEmpty}
//             />
//             {!isEmpty && (
//               <p className={styles.disclaimer}>
//                 SQL Analyst can make mistakes. Verify important queries before running.
//               </p>
//             )}
//           </div>
//         </div>
//       </main>

//       {/* Login Modal */}
//       <LoginModal
//         isOpen={isLoginModalOpen}
//         onClose={() => setIsLoginModalOpen(false)}
//         onLoginSuccess={handleLoginSuccess}
//         queryCount={chats.length}
//       />

//       {/* Database Schema Explorer Modal */}
//       <SchemaModal
//         isOpen={isSchemaOpen}
//         onClose={() => setIsSchemaOpen(false)}
//       />

//       {/* Dynamic Insights Modal */}
//       <InsightsModal
//         isOpen={isInsightsOpen}
//         onClose={() => setIsInsightsOpen(false)}
//       />


//     </div>
//   )
// }



'use client'

import { useRef, useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useAnalystChat } from '@/lib/hooks'
import { ChatInterface } from '@/components/ChatInterface'
import { ChatMessage } from '@/components/ChatMessage'
import { Sidebar } from '@/components/Sidebar'
import { SchemaModal } from '@/components/SchemaModal'
import { InsightsModal } from '@/components/InsightsModal'

import styles from './page.module.css'

export default function Home() {
  const { user, isSignedIn } = useUser()
  const userEmail = user?.primaryEmailAddress?.emailAddress

  const {
    chats,
    loading,
    error,
    sendMessage,
    clearChats,
    userSessions,
    selectSession,
    deleteSession,
  } = useAnalystChat(userEmail)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [isSchemaOpen, setIsSchemaOpen] = useState(false)
  const [isInsightsOpen, setIsInsightsOpen] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (chats.length > 0) {
      scrollToBottom()
    }
  }, [chats])

  const isEmpty = chats.length === 0

  const sidebarHistory = chats.map((c) => ({
    id: c.id,
    message: c.message,
    timestamp: c.timestamp,
  }))

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <Sidebar
        chatHistory={sidebarHistory}
        userSessions={userSessions}
        onNewChat={clearChats}
        onSelectChat={selectSession}
        onDeleteSession={deleteSession}
        onOpenDatabase={() => setIsSchemaOpen(true)}
        onOpenInsights={() => setIsInsightsOpen(true)}
      />

      {/* Main Area */}
      <main className={styles.main}>
        {/* Top bar */}
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            {!isEmpty && (
              <h2 className={styles.threadTitle}>
                {chats[0]?.message.slice(0, 50)}
                {chats[0]?.message.length > 50 ? '...' : ''}
              </h2>
            )}
          </div>
          <div className={styles.topBarRight}>
            {!isSignedIn && chats.length >= 3 && (
              <span className={styles.loginBannerText} style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Sign in from the sidebar to persist your chat history
              </span>
            )}

            {!isEmpty && (
              <button onClick={clearChats} className={styles.newThreadBtn} id="clear-btn">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                New thread
              </button>
            )}
          </div>
        </header>

        {/* Scrollable content */}
        <div
          className={`${styles.content} ${
            isEmpty ? styles.contentCentered : styles.contentScrollable
          }`}
        >
          {/* Chat messages */}
          {!isEmpty && (
            <div className={styles.messages}>
              <div className={styles.messagesInner}>
                {chats.map((chat) => (
                  <ChatMessage
                    key={chat.id}
                    message={chat.message}
                    response={chat.response}
                    timestamp={chat.timestamp}
                  />
                ))}
                {loading && (
                  <ChatMessage
                    key="loading"
                    message=""
                    response=""
                    timestamp={new Date()}
                    isLoading
                  />
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          {/* Input area */}
          <div
            className={`${styles.inputWrapper} ${
              isEmpty ? styles.inputWrapperCentered : styles.inputWrapperBottom
            }`}
          >
            <ChatInterface
              onSendMessage={async (msg) => {
                await sendMessage(msg)
              }}
              loading={loading}
              error={error}
              isEmpty={isEmpty}
            />
            {!isEmpty && (
              <p className={styles.disclaimer}>
                SQL Analyst can make mistakes. Verify important queries before running.
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Database Schema Explorer Modal */}
      <SchemaModal
        isOpen={isSchemaOpen}
        onClose={() => setIsSchemaOpen(false)}
      />

      {/* Dynamic Insights Modal */}
      <InsightsModal
        isOpen={isInsightsOpen}
        onClose={() => setIsInsightsOpen(false)}
      />
    </div>
  )
}