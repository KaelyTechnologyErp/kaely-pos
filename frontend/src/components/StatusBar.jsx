import React from 'react'

export default function StatusBar({ user, shift, syncStatus, onLogout }) {
  const syncColor = syncStatus?.status === 'healthy' ? 'bg-emerald-500'
    : syncStatus?.status === 'offline' ? 'bg-red-500'
    : 'bg-yellow-500'

  const pending = syncStatus?.pending_records || 0

  return (
    <div className="h-10 bg-kaely-800 text-white flex items-center justify-between px-4 text-sm shrink-0">
      <div className="flex items-center gap-4">
        <span className="font-bold text-kaely-100">KaelyTech POS</span>
        {shift && (
          <span className="text-kaely-200">
            Turno: {shift.cashier_name}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${syncColor}`} />
          <span className="text-xs text-kaely-200">
            {syncStatus?.status === 'healthy' ? 'Sync OK' : syncStatus?.status === 'offline' ? 'Sin conexion' : 'Sincronizando...'}
            {pending > 0 && ` (${pending} pendientes)`}
          </span>
        </div>

        <span className="text-kaely-200">{user?.full_name}</span>
        <span className="text-xs bg-kaely-600 px-2 py-0.5 rounded">{user?.role}</span>

        <button
          onClick={onLogout}
          className="text-xs text-kaely-300 hover:text-white transition-colors"
        >
          Cerrar sesion
        </button>
      </div>
    </div>
  )
}
