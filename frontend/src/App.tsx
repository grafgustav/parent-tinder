// src/App.tsx
import { useState } from 'react'
import './assets/styles/global.css'
import './assets/styles/theme.css'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import Register from './pages/auth/Register'
import ViewProfile from './pages/profile/ViewProfile'
import EditProfile from './pages/profile/EditProfile'
import Matches from './pages/matching/Matches'
import Messages from './pages/messages/Messages'
import Events from './pages/events/Events'

function App() {
  // This is a simple way to handle routing without React Router
  // In a production app, you would use React Router instead
  const [currentPage, setCurrentPage] = useState('home');

  // Navigation function to pass to components
  const navigateTo = (page: string) => {
    setCurrentPage(page);
    // Scroll to top on page change
    window.scrollTo(0, 0);
  };

  // Render the current page
  const renderPage = () => {
    switch (currentPage) {
      case 'register':
        return <Register />;
      case 'profile':
        return <ViewProfile navigateTo={navigateTo} />;
      case 'editProfile':
        return <EditProfile navigateTo={navigateTo} />;
      case 'matches':
        return <Matches navigateTo={navigateTo} />;
      case 'messages':
        return <Messages navigateTo={navigateTo} />;
      case 'events':
        return <Events navigateTo={navigateTo} />;
      case 'home':
      default:
        return <Home navigateTo={navigateTo} />;
    }
  };

  return (
    <ThemeProvider>
      <div className="app">
        <Navbar navigateTo={navigateTo} />
        <main>
          {renderPage()}
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App