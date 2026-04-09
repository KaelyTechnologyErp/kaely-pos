import React, { useState, useEffect } from 'react'

export default function ShiftScreen({ user, onShiftOpen, onLogout }) {
  const [openingAmount, setOpeningAmount] = useState('1000.00')
  const [loading, setLoading] = useState(false)
  const [currentShift, setCurrentShift] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    checkCurrentShift()
  }, [])

  const checkCurrentShift = async () => {
    try {
      const result = await window.go.main.App.GetCurrentShift()
      const data = JSON.parse(result)
      if (data.id && data.status === 'open') {
        setCurrentShift(data)
      }
    } catch {}
  }

  const handleOpen = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await window.go.main.App.OpenShift(user.full_name, openingAmount)
      if (result.error) {
        setError(result.error)
      } else {
        onShiftOpen({
          id: result.id,
          cashier_name: user.full_name,
          opening_amount: openingAmount,
          status: 'open',
        })
      }
    } catch (e) {
      setError('Error al abrir turno: ' + e.message)
    }
    setLoading(false)
  }

  const handleResume = () => {
    onShiftOpen(currentShift)
  }

  return (
    <div className="h-full flex items-center justify-center bg-gray-50">
      <div className="card p-8 w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-kaely-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-kaely-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Apertura de Turno</h2>
          <p className="text-gray-500 mt-1">Hola, {user?.full_name}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {currentShift ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="font-medium text-emerald-800">Turno activo encontrado</p>
              <p className="text-sm text-emerald-600 mt-1">
                Cajero: {currentShift.cashier_name} | Apertura: ${currentShift.opening_amount}
              </p>
            </div>
            <button className="btn-primary w-full text-lg py-3" onClick={handleResume}>
              Continuar con turno activo
            </button>
            <button className="btn-secondary w-full" onClick={onLogout}>
              Cerrar sesion
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fondo inicial de caja
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  className="input-field pl-8 text-2xl font-bold text-center"
                  value={openingAmount}
                  onChange={e => setOpeningAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {['500', '1000', '1500', '2000'].map(amount => (
                <button
                  key={amount}
                  className="btn-secondary text-sm"
                  onClick={() => setOpeningAmount(amount + '.00')}
                >
                  ${amount}
                </button>
              ))}
            </div>

            <button
              className="btn-primary w-full text-lg py-3"
              onClick={handleOpen}
              disabled={loading || !openingAmount}
            >
              {loading ? 'Abriendo...' : 'Abrir Turno'}
            </button>

            <button className="btn-secondary w-full" onClick={onLogout}>
              Cerrar sesion
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
