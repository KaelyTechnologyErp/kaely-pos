import React, { useState, useRef, useEffect } from 'react'

export default function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState('pin') // 'pin' or 'credentials'
  const [pin, setPin] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const pinRef = useRef(null)

  useEffect(() => {
    if (mode === 'pin' && pinRef.current) pinRef.current.focus()
  }, [mode])

  const handlePinLogin = async () => {
    if (pin.length < 4) return
    setLoading(true)
    setError('')
    try {
      const result = await window.go.main.App.PinLogin(pin)
      if (result.success) {
        onLogin(result)
      } else {
        setError(result.error || 'PIN invalido')
        setPin('')
      }
    } catch (e) {
      setError('Error de conexion con el agente')
    }
    setLoading(false)
  }

  const handleCredentialsLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await window.go.main.App.Login(username, password)
      if (result.success) {
        onLogin(result)
      } else {
        setError(result.error || 'Credenciales invalidas')
      }
    } catch (e) {
      setError('Error de conexion con el agente')
    }
    setLoading(false)
  }

  const handleNumpad = (digit) => {
    if (pin.length < 6) setPin(prev => prev + digit)
  }

  const handlePinBackspace = () => setPin(prev => prev.slice(0, -1))

  useEffect(() => {
    if (pin.length === 4) handlePinLogin()
  }, [pin])

  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-kaely-800 to-kaely-900">
      <div className="card p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-kaely-800">KaelyTech</h1>
          <p className="text-gray-500 mt-1">Punto de Venta</p>
        </div>

        {/* Tab switcher */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'pin' ? 'bg-white shadow text-kaely-700' : 'text-gray-500'}`}
            onClick={() => setMode('pin')}
          >
            PIN Rapido
          </button>
          <button
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'credentials' ? 'bg-white shadow text-kaely-700' : 'text-gray-500'}`}
            onClick={() => setMode('credentials')}
          >
            Usuario y Contrasena
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {mode === 'pin' ? (
          <div>
            {/* PIN dots */}
            <div className="flex justify-center gap-3 mb-6">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full border-2 transition-colors ${
                    i < pin.length ? 'bg-kaely-600 border-kaely-600' : 'border-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                <button key={n} className="numpad-btn" onClick={() => handleNumpad(String(n))}>
                  {n}
                </button>
              ))}
              <button className="numpad-btn text-red-500" onClick={() => setPin('')}>C</button>
              <button className="numpad-btn" onClick={() => handleNumpad('0')}>0</button>
              <button className="numpad-btn text-kaely-600" onClick={handlePinBackspace}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414-6.414A2 2 0 0110.828 5H21a1 1 0 011 1v12a1 1 0 01-1 1H10.828a2 2 0 01-1.414-.586L3 12z" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCredentialsLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
              <input
                type="text"
                className="input-field"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contrasena</label>
              <input
                type="password"
                className="input-field"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        )}

        {loading && (
          <div className="mt-4 text-center text-sm text-gray-500">Conectando...</div>
        )}
      </div>
    </div>
  )
}
