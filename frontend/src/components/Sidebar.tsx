// src/components/Sidebar.tsx
"use client";

import { SignInButton, UserButton, useUser, useClerk } from "@clerk/nextjs";
import styles from "./Sidebar.module.css";
import { StatusIndicator } from "./StatusIndicator";

interface SidebarProps {
  chatHistory: Array<{ id: string; message: string; timestamp: Date }>;
  userSessions?: Array<{ session_id: string; title: string }>;
  onNewChat: () => void;
  onSelectChat?: (id: string) => void;
  onDeleteSession?: (sessionId: string) => void;
  activeChatId?: string;
  onOpenDatabase?: () => void;
  onOpenInsights?: () => void;
  activeView?: "home" | "database" | "insights";
}

export const Sidebar = ({
  chatHistory : _chatHistory,
  userSessions,
  onNewChat,
  onSelectChat,
  onDeleteSession,
  activeChatId,
  onOpenDatabase,
  onOpenInsights,
  activeView = "home",
}: SidebarProps) => {
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk(); // 👈 Clerk ka signOut method

  const hasUserSessions = userSessions && userSessions.length > 0;

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L14.5 9.5H22L16 14L18.5 21.5L12 17L5.5 21.5L8 14L2 9.5H9.5L12 2Z"
              fill="currentColor"
              opacity="0.9"
            />
          </svg>
        </div>
        <span className={styles.logoText}>SQL Analyst</span>
      </div>

      {/* New Thread Button */}
      <button
        className={styles.newButton}
        onClick={onNewChat}
        id="new-thread-btn"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
        New Thread
      </button>

      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navSection}>
          <button
            type="button"
            onClick={onNewChat}
            className={`${styles.navItem} ${activeView === "home" ? styles.navItemActive : ""}`}
            id="nav-home"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinejoin="round" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Home
          </button>

          <button
            type="button"
            onClick={onOpenDatabase}
            className={`${styles.navItem} ${activeView === "database" ? styles.navItemActive : ""}`}
            id="nav-schema"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
            </svg>
            Database
          </button>

          <button
            type="button"
            onClick={onOpenInsights}
            className={`${styles.navItem} ${activeView === "insights" ? styles.navItemActive : ""}`}
            id="nav-insights"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M18 20V10M12 20V4M6 20v-6" />
              <rect x="1" y="1" width="22" height="22" rx="2" ry="2" opacity="0" />
            </svg>
            Insights
          </button>
        </div>

        {/* Saved User Database Sessions */}
        {isSignedIn && hasUserSessions ? (
          <div className={styles.historySection}>
            <span className={styles.sectionLabel}>Saved History</span>
            {userSessions.slice(0, 15).map((sess) => (
              <div
                key={sess.session_id}
                className={`${styles.historyItemWrapper} ${activeChatId === sess.session_id ? styles.historyItemActive : ""}`}
              >
                <button
                  className={styles.historyItem}
                  onClick={() => onSelectChat?.(sess.session_id)}
                  id={`session-${sess.session_id}`}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={styles.historyIcon}>
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                  <span className={styles.historyText}>{sess.title || sess.session_id}</span>
                </button>

                <button
                  type="button"
                  className={styles.deleteBtn}
                  title="Delete Session"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Do you want to delete this session?")) {
                      onDeleteSession?.(sess.session_id);
                    }
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </nav>

      {/* Footer */}
      <div className={styles.footer}>
        {isSignedIn && user ? (
          <div className={styles.userCard}>
            {/* Clerk Avatar */}
            <UserButton afterSignOutUrl="/" />

            <div className={styles.userInfo}>
              <span className={styles.userName}>
                {user.primaryEmailAddress?.emailAddress}
              </span>
              <span className={styles.userStatus}>Pro Analyst</span>
            </div>

            {/* Direct Logout Button */}
            <button
              className={styles.logoutBtn}
              onClick={() => signOut({ redirectUrl: '/' })}
              title="Sign Out"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        ) : (
          <SignInButton mode="modal">
            <button className={styles.loginBtn} id="sidebar-login-btn">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Sign In / Register
            </button>
          </SignInButton>
        )}
        <StatusIndicator />
      </div>
    </aside>
  );
};





// // src/components/Sidebar.tsx
// "use client";


// import { SignInButton, UserButton, useUser } from '@clerk/nextjs'
// import styles from "./Sidebar.module.css";
// import { StatusIndicator } from "./StatusIndicator";

// interface SidebarProps {
//   chatHistory: Array<{ id: string; message: string; timestamp: Date }>;
//   userSessions?: Array<{ session_id: string; title: string }>;
//   onNewChat: () => void;
//   onSelectChat?: (id: string) => void;
//   onDeleteSession?: (sessionId: string) => void; // 👈 Delete prop
//   activeChatId?: string;
//   user: { email: string } | null;
//   onOpenLogin: () => void;
//   onLogout: () => void;
//   onOpenDatabase?: () => void; // 👈 1. Prop add kiya
//   onOpenInsights?: () => void ; // 👈 Prop

//   activeView?: "home" | "database" | "insights"; // 👈 Optional active state
// }

// export const Sidebar = ({
//   chatHistory,
//   userSessions,
//   onNewChat,
//   onSelectChat,
//   onDeleteSession,
//   activeChatId,
//   user,
//   onOpenLogin,
//   onLogout,
//   onOpenDatabase,
//   onOpenInsights,
//   activeView = "home",
// }: SidebarProps) => {
//   const hasUserSessions = userSessions && userSessions.length > 0;

//   return (
//     <aside className={styles.sidebar}>
//       {/* Logo */}
//       <div className={styles.logo}>
//         <div className={styles.logoIcon}>
//           <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
//             <path
//               d="M12 2L14.5 9.5H22L16 14L18.5 21.5L12 17L5.5 21.5L8 14L2 9.5H9.5L12 2Z"
//               fill="currentColor"
//               opacity="0.9"
//             />
//           </svg>
//         </div>
//         <span className={styles.logoText}>SQL Analyst</span>
//       </div>

//       {/* New Thread Button */}
//       <button
//         className={styles.newButton}
//         onClick={onNewChat}
//         id="new-thread-btn"
//       >
//         <svg
//           width="16"
//           height="16"
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth="2.5"
//         >
//           <path d="M12 5v14M5 12h14" strokeLinecap="round" />
//         </svg>
//         New Thread
//       </button>

//       {/* Navigation
//       <nav className={styles.nav}>
//         <div className={styles.navSection}>
//           <a href="#" className={`${styles.navItem} ${styles.navItemActive}`} id="nav-home">
//             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
//               <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinejoin="round"/>
//               <polyline points="9 22 9 12 15 12 15 22"/>
//             </svg>
//             Home
//           </a>


          
//           <a href="#" className={styles.navItem} id="nav-schema">
//             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
//               <ellipse cx="12" cy="5" rx="9" ry="3"/>
//               <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
//               <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
//             </svg>
//             Database
//           </a>
//           <a href="#" className={styles.navItem} id="nav-history">
//             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
//               <circle cx="12" cy="12" r="10"/>
//               <polyline points="12 6 12 12 16 14"/>
//             </svg>
//             History
//           </a>
//           <a href="#" className={styles.navItem} id="nav-insights">
//             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
//               <path d="M18 20V10M12 20V4M6 20v-6"/>
//               <rect x="1" y="1" width="22" height="22" rx="2" ry="2" opacity="0"/>
//             </svg>
//             Insights
//           </a>
//         </div> */}

//       {/* Navigation */}
//       <nav className={styles.nav}>
//         <div className={styles.navSection}>
//           <button
//             type="button"
//             onClick={onNewChat}
//             className={`${styles.navItem} ${activeView === "home" ? styles.navItemActive : ""}`}
//             id="nav-home"
//           >
//             <svg
//               width="16"
//               height="16"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="1.8"
//             >
//               <path
//                 d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
//                 strokeLinejoin="round"
//               />
//               <polyline points="9 22 9 12 15 12 15 22" />
//             </svg>
//             Home
//           </button>

//           {/* ✅ DATABASE BUTTON: href="#" hatakar button aur onClick lagaya */}
//           <button
//             type="button"
//             onClick={onOpenDatabase}
//             className={`${styles.navItem} ${activeView === "database" ? styles.navItemActive : ""}`}
//             id="nav-schema"
//           >
//             <svg
//               width="16"
//               height="16"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="1.8"
//             >
//               <ellipse cx="12" cy="5" rx="9" ry="3" />
//               <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
//               <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
//             </svg>
//             Database
//           </button>

//           {/* <button 
//             type="button" 
//             className={styles.navItem} 
//             id="nav-history"
//           >
//             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
//               <circle cx="12" cy="12" r="10"/>
//               <polyline points="12 6 12 12 16 14"/>
//             </svg>
//             History
//           </button> */}

//           <button type="button"  onClick={onOpenInsights}    className={styles.navItem} id="nav-insights">
//             <svg
//               width="16"
//               height="16"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="1.8"
//             >
//               <path d="M18 20V10M12 20V4M6 20v-6" />
//               <rect
//                 x="1"
//                 y="1"
//                 width="22"
//                 height="22"
//                 rx="2"
//                 ry="2"
//                 opacity="0"
//               />
//             </svg>
//             Insights
//           </button>
//         </div>

//         {/* Saved User Database Sessions
//         {hasUserSessions ? (
//           <div className={styles.historySection}>
//             <span className={styles.sectionLabel}>Saved History</span>
//             {userSessions.slice(0, 15).map((sess) => (
//               <button
//                 key={sess.session_id}
//                 className={`${styles.historyItem} ${activeChatId === sess.session_id ? styles.historyItemActive : ''}`}
//                 onClick={() => onSelectChat?.(sess.session_id)}
//                 id={`session-${sess.session_id}`}
//               >
//                 <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={styles.historyIcon}>
//                   <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
//                 </svg>
//                 <span className={styles.historyText}>{sess.title}</span>
//               </button>
//             ))}
//           </div>
//         ) : chatHistory.length > 0 ? (
//           <div className={styles.historySection}>
//             <span className={styles.sectionLabel}>Recent</span>
//             {chatHistory.slice(-8).reverse().map((chat) => (
//               <button
//                 key={chat.id}
//                 className={`${styles.historyItem} ${activeChatId === chat.id ? styles.historyItemActive : ''}`}
//                 onClick={() => onSelectChat?.(chat.id)}
//                 id={`history-${chat.id}`}
//               >
//                 <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={styles.historyIcon}>
//                   <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
//                 </svg>
//                 <span className={styles.historyText}>{chat.message}</span>
//               </button>
//             ))}
//           </div>
//         ) : null} */}

//         {/* Saved User Database Sessions */}
//         {hasUserSessions ? (
//           <div className={styles.historySection}>
//             <span className={styles.sectionLabel}>Saved History</span>
//             {userSessions.slice(0, 15).map((sess) => (
//               <div
//                 key={sess.session_id}
//                 className={`${styles.historyItemWrapper} ${activeChatId === sess.session_id ? styles.historyItemActive : ""}`}
//               >
//                 {/* Chat Session Select Button */}
//                 <button
//                   className={styles.historyItem}
//                   onClick={() => onSelectChat?.(sess.session_id)}
//                   id={`session-${sess.session_id}`}
//                 >
//                   <svg
//                     width="13"
//                     height="13"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="1.8"
//                     className={styles.historyIcon}
//                   >
//                     <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h9a2 2 0 012 2v1" />
//                   </svg>
//                   <span className={styles.historyText}>
//                     {sess.title || sess.session_id}
//                   </span>
//                 </button>

//                 {/* 🗑️ Delete Button */}
//                 <button
//                   type="button"
//                   className={styles.deleteBtn}
//                   title="Delete Session"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     if (confirm("Do you want to delete this session?")) {
//                       onDeleteSession?.(sess.session_id);
//                     }
//                   }}
//                 >
//                   <svg
//                     width="13"
//                     height="13"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                   >
//                     <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
//                   </svg>
//                 </button>
//               </div>
//             ))}
//           </div>
//         ) : null}
//       </nav>

//       {/* Footer */}
//       <div className={styles.footer}>
//         {user ? (
//           <div className={styles.userCard}>
//             <div className={styles.avatar}>
//               {user.email.charAt(0).toUpperCase()}
//             </div>
//             <div className={styles.userInfo}>
//               <span className={styles.userName}>{user.email}</span>
//               <span className={styles.userStatus}>Pro Analyst</span>
//             </div>
//             <button
//               className={styles.logoutBtn}
//               onClick={onLogout}
//               title="Sign Out"
//             >
//               <svg
//                 width="14"
//                 height="14"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//               >
//                 <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
//                 <polyline points="16 17 21 12 16 7" />
//                 <line x1="21" y1="12" x2="9" y2="12" />
//               </svg>
//             </button>
//           </div>
//         ) : (
//           <button
//             className={styles.loginBtn}
//             onClick={onOpenLogin}
//             id="sidebar-login-btn"
//           >
//             <svg
//               width="15"
//               height="15"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2"
//             >
//               <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
//               <polyline points="10 17 15 12 10 7" />
//               <line x1="15" y1="12" x2="3" y2="12" />
//             </svg>
//             Sign In / Register
//           </button>
//         )}
//         <StatusIndicator />
//       </div>
//     </aside>
//   );
// };




// // src/components/Sidebar.tsx
// "use client";

// import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
// import styles from "./Sidebar.module.css";
// import { StatusIndicator } from "./StatusIndicator";

// interface SidebarProps {
//   chatHistory: Array<{ id: string; message: string; timestamp: Date }>;
//   userSessions?: Array<{ session_id: string; title: string }>;
//   onNewChat: () => void;
//   onSelectChat?: (id: string) => void;
//   onDeleteSession?: (sessionId: string) => void;
//   activeChatId?: string;
//   onOpenDatabase?: () => void;
//   onOpenInsights?: () => void;
//   activeView?: "home" | "database" | "insights";
// }

// export const Sidebar = ({
//   chatHistory,
//   userSessions,
//   onNewChat,
//   onSelectChat,
//   onDeleteSession,
//   activeChatId,
//   onOpenDatabase,
//   onOpenInsights,
//   activeView = "home",
// }: SidebarProps) => {
//   const { isSignedIn, user } = useUser();
//   const hasUserSessions = userSessions && userSessions.length > 0;

//   return (
//     <aside className={styles.sidebar}>
//       {/* Logo */}
//       <div className={styles.logo}>
//         <div className={styles.logoIcon}>
//           <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
//             <path
//               d="M12 2L14.5 9.5H22L16 14L18.5 21.5L12 17L5.5 21.5L8 14L2 9.5H9.5L12 2Z"
//               fill="currentColor"
//               opacity="0.9"
//             />
//           </svg>
//         </div>
//         <span className={styles.logoText}>SQL Analyst</span>
//       </div>

//       {/* New Thread Button */}
//       <button
//         className={styles.newButton}
//         onClick={onNewChat}
//         id="new-thread-btn"
//       >
//         <svg
//           width="16"
//           height="16"
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth="2.5"
//         >
//           <path d="M12 5v14M5 12h14" strokeLinecap="round" />
//         </svg>
//         New Thread
//       </button>

//       {/* Navigation */}
//       <nav className={styles.nav}>
//         <div className={styles.navSection}>
//           <button
//             type="button"
//             onClick={onNewChat}
//             className={`${styles.navItem} ${activeView === "home" ? styles.navItemActive : ""}`}
//             id="nav-home"
//           >
//             <svg
//               width="16"
//               height="16"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="1.8"
//             >
//               <path
//                 d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
//                 strokeLinejoin="round"
//               />
//               <polyline points="9 22 9 12 15 12 15 22" />
//             </svg>
//             Home
//           </button>

//           <button
//             type="button"
//             onClick={onOpenDatabase}
//             className={`${styles.navItem} ${activeView === "database" ? styles.navItemActive : ""}`}
//             id="nav-schema"
//           >
//             <svg
//               width="16"
//               height="16"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="1.8"
//             >
//               <ellipse cx="12" cy="5" rx="9" ry="3" />
//               <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
//               <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
//             </svg>
//             Database
//           </button>

//           <button
//             type="button"
//             onClick={onOpenInsights}
//             className={`${styles.navItem} ${activeView === "insights" ? styles.navItemActive : ""}`}
//             id="nav-insights"
//           >
//             <svg
//               width="16"
//               height="16"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="1.8"
//             >
//               <path d="M18 20V10M12 20V4M6 20v-6" />
//               <rect
//                 x="1"
//                 y="1"
//                 width="22"
//                 height="22"
//                 rx="2"
//                 ry="2"
//                 opacity="0"
//               />
//             </svg>
//             Insights
//           </button>
//         </div>

//         {/* Saved User Database Sessions */}
//         {isSignedIn && hasUserSessions ? (
//           <div className={styles.historySection}>
//             <span className={styles.sectionLabel}>Saved History</span>
//             {userSessions.slice(0, 15).map((sess) => (
//               <div
//                 key={sess.session_id}
//                 className={`${styles.historyItemWrapper} ${activeChatId === sess.session_id ? styles.historyItemActive : ""}`}
//               >
//                 <button
//                   className={styles.historyItem}
//                   onClick={() => onSelectChat?.(sess.session_id)}
//                   id={`session-${sess.session_id}`}
//                 >
//                   <svg
//                     width="13"
//                     height="13"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="1.8"
//                     className={styles.historyIcon}
//                   >
//                     <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h9a2 2 0 012 2v1" />
//                   </svg>
//                   <span className={styles.historyText}>
//                     {sess.title || sess.session_id}
//                   </span>
//                 </button>

//                 <button
//                   type="button"
//                   className={styles.deleteBtn}
//                   title="Delete Session"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     if (confirm("Do you want to delete this session?")) {
//                       onDeleteSession?.(sess.session_id);
//                     }
//                   }}
//                 >
//                   <svg
//                     width="13"
//                     height="13"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                   >
//                     <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
//                   </svg>
//                 </button>
//               </div>
//             ))}
//           </div>
//         ) : null}
//       </nav>

//       {/* Footer / Clerk Authentication Card */}
//       <div className={styles.footer}>
//         {isSignedIn && user ? (
//           <div className={styles.userCard}>
//             <UserButton afterSignOutUrl="/" />
//             <div className={styles.userInfo}>
//               <span className={styles.userName}>
//                 {user.primaryEmailAddress?.emailAddress}
//               </span>
//               <span className={styles.userStatus}>Pro Analyst</span>
//             </div>
//           </div>
//         ) : (
//           <SignInButton mode="modal">
//             <button className={styles.loginBtn} id="sidebar-login-btn">
//               <svg
//                 width="15"
//                 height="15"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//               >
//                 <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
//                 <polyline points="10 17 15 12 10 7" />
//                 <line x1="15" y1="12" x2="3" y2="12" />
//               </svg>
//               Sign In / Register
//             </button>
//           </SignInButton>
//         )}
//         <StatusIndicator />
//       </div>
//     </aside>
//   );
// };

