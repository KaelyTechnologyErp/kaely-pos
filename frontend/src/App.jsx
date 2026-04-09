import React, { useState, useEffect } from 'react'
import LoginScreen from './pages/LoginScreen'
import ShiftScreen from './pages/ShiftScreen'
import POSScreen from './pages/POSScreen'
import StatusBar from './components/StatusBar'

export default function App() {
  const [screen, setScreen] = useState('login')
  const [user, setUser] = useState(null)
  const [shift, setShift] = useState(null)
  const [syncStatus, setSyncStatus] = useState({ status: 'checking' })

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const result = await window.go.main.App.GetHealth()
        setSyncStatus(JSON.parse(result))
      } catch {
        setSyncStatus({ status: 'offline' })
      }
    }
    checkHealth()
    const interval = setInterval(checkHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    setScreen('shift')
  }

  const handleShiftOpen = (shiftData) => {
    setShift(shiftData)
    setScreen('pos')
  }

  const handleShiftClose = () => {
    setShift(null)
    setScreen('shift')
  }

  const handleLogout = () => {
    window.go.main.App.Logout()
    setUser(null)
    setShift(null)
    setScreen('login')
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {user && (
        <StatusBar
          user={user}
          shift={shift}
          syncStatus={syncStatus}
          onLogout={handleLogout}
        />
      )}
      <div className="flex-1 overflow-hidden">
        {screen === 'login' && <LoginScreen onLogin={handleLogin} />}
        {screen === 'shift' && (
          <ShiftScreen
            user={user}
            onShiftOpen={handleShiftOpen}
            onLogout={handleLogout}
          />
        )}
        {screen === 'pos' && (
          <POSScreen
            user={user}
            shift={shift}
            onShiftClose={handleShiftClose}
          />
        )}
      </div>
    </div>
  )
}
