import React, { useState } from 'react'

export default function ShiftCloseModal({ shift, onClose, onConfirm }) {
  const [closingAmount, setClosingAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    if (!closingAmount) return
    setLoading(true)
    await onConfirm(closingAmount)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="card p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-6">Cerrar Turno</h2>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Cajero</span>
            <span className="font-medium">{shift?.cashier_name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Fondo inicial</span>
            <span className="font-medium">${shift?.opening_amount}</span>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Efectivo en caja al cerrar
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
            <input
              type="number"
              step="0.01"
              className="input-field pl-8 text-2xl font-bold text-center"
              value={closingAmount}
              onChange={e => setClosingAmount(e.target.value)}
              placeholder="0.00"
              autoFocus
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button className="btn-secondary flex-1" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn-danger flex-1"
            onClick={handleConfirm}
            disabled={loading || !closingAmount}
          >
            {loading ? 'Cerrando...' : 'Cerrar Turno'}
          </button>
        </div>
      </div>
    </div>
  )
}
