import React, { useState, useRef, useEffect } from 'react'

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Efectivo', icon: '💵', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { id: 'card', label: 'Tarjeta', icon: '💳', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { id: 'transfer', label: 'Transferencia', icon: '🏦', color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { id: 'points', label: 'Puntos', icon: '🎯', color: 'bg-amber-50 border-amber-200 text-amber-700' },
]

export default function PaymentModal({ total, onComplete, onClose }) {
  const [method, setMethod] = useState('cash')
  const [received, setReceived] = useState('')
  const [reference, setReference] = useState('')
  const [payments, setPayments] = useState([])
  const [isSplit, setIsSplit] = useState(false)
  const inputRef = useRef(null)

  const totalNum = parseFloat(total)
  const paidSoFar = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
  const remaining = totalNum - paidSoFar

  useEffect(() => {
    inputRef.current?.focus()
  }, [method])

  const handleQuickAmount = (amount) => {
    setReceived(amount.toFixed(2))
  }

  const handlePay = () => {
    if (isSplit) {
      // Add to split payments
      const amount = parseFloat(received) || remaining
      setPayments(prev => [...prev, {
        method,
        amount: Math.min(amount, remaining).toFixed(4),
        received: method === 'cash' ? (received || amount.toFixed(4)) : amount.toFixed(4),
        reference,
      }])
      setReceived('')
      setReference('')

      // Check if fully paid
      if (amount >= remaining) {
        // Complete with all payments
        const allPayments = [...payments, {
          method,
          amount: Math.min(amount, remaining).toFixed(4),
          received: method === 'cash' ? (received || amount.toFixed(4)) : amount.toFixed(4),
          reference,
        }]
        onComplete(allPayments)
      }
      return
    }

    // Single payment
    const finalReceived = method === 'cash' ? (received || total) : total
    onComplete([{
      method,
      amount: total,
      received: finalReceived,
      reference,
    }])
  }

  const change = method === 'cash' && parseFloat(received) > totalNum
    ? (parseFloat(received) - totalNum).toFixed(2)
    : '0.00'

  // Quick cash amounts
  const quickAmounts = []
  const rounded = Math.ceil(totalNum / 10) * 10
  if (rounded !== totalNum) quickAmounts.push(rounded)
  quickAmounts.push(Math.ceil(totalNum / 50) * 50)
  quickAmounts.push(Math.ceil(totalNum / 100) * 100)
  quickAmounts.push(Math.ceil(totalNum / 200) * 200)
  const uniqueAmounts = [...new Set(quickAmounts)].slice(0, 4)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="card p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Cobrar</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Total */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500">
            {isSplit && paidSoFar > 0 ? 'Restante' : 'Total a cobrar'}
          </p>
          <p className="text-4xl font-bold text-gray-900">
            ${isSplit ? remaining.toFixed(2) : parseFloat(total).toFixed(2)}
          </p>
        </div>

        {/* Payment method selector */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {PAYMENT_METHODS.map(m => (
            <button
              key={m.id}
              className={`p-3 rounded-lg border-2 text-center transition-all ${
                method === m.id ? m.color + ' border-current' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setMethod(m.id)}
            >
              <span className="text-2xl">{m.icon}</span>
              <p className="text-xs font-medium mt-1">{m.label}</p>
            </button>
          ))}
        </div>

        {/* Split payment toggle */}
        <label className="flex items-center gap-2 mb-4 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            className="rounded border-gray-300"
            checked={isSplit}
            onChange={e => setIsSplit(e.target.checked)}
          />
          Pago mixto (dividir entre metodos)
        </label>

        {/* Previous payments in split mode */}
        {isSplit && payments.length > 0 && (
          <div className="mb-4 space-y-1">
            {payments.map((p, i) => (
              <div key={i} className="flex justify-between text-sm bg-gray-50 rounded px-3 py-1">
                <span className="text-gray-600">{PAYMENT_METHODS.find(m => m.id === p.method)?.label}</span>
                <span className="font-medium">${parseFloat(p.amount).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Amount input for cash */}
        {method === 'cash' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Recibido</label>
            <input
              ref={inputRef}
              type="number"
              step="0.01"
              className="input-field text-2xl font-bold text-center"
              value={received}
              onChange={e => setReceived(e.target.value)}
              placeholder={parseFloat(total).toFixed(2)}
            />

            {/* Quick amounts */}
            <div className="grid grid-cols-4 gap-2 mt-2">
              <button className="btn-secondary text-sm" onClick={() => handleQuickAmount(totalNum)}>
                Exacto
              </button>
              {uniqueAmounts.map(amt => (
                <button key={amt} className="btn-secondary text-sm" onClick={() => handleQuickAmount(amt)}>
                  ${amt}
                </button>
              ))}
            </div>

            {/* Change */}
            {parseFloat(change) > 0 && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
                <p className="text-sm text-amber-700">Cambio</p>
                <p className="text-3xl font-bold text-amber-800">${change}</p>
              </div>
            )}
          </div>
        )}

        {/* Reference for card/transfer */}
        {(method === 'card' || method === 'transfer') && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {method === 'card' ? 'Referencia / Autorizacion' : 'Referencia de transferencia'}
            </label>
            <input
              ref={inputRef}
              type="text"
              className="input-field"
              value={reference}
              onChange={e => setReference(e.target.value)}
              placeholder={method === 'card' ? 'Ultimos 4 digitos o auth' : 'No. referencia'}
            />
          </div>
        )}

        {/* Split amount input */}
        {isSplit && (method === 'card' || method === 'transfer' || method === 'points') && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto con este metodo</label>
            <input
              type="number"
              step="0.01"
              className="input-field text-lg font-bold text-center"
              value={received}
              onChange={e => setReceived(e.target.value)}
              placeholder={remaining.toFixed(2)}
            />
          </div>
        )}

        {/* Confirm button */}
        <button
          className="btn-primary w-full text-lg py-3 mt-2"
          onClick={handlePay}
        >
          {isSplit ? `Agregar ${PAYMENT_METHODS.find(m => m.id === method)?.label}` : 'Confirmar Pago'}
        </button>
      </div>
    </div>
  )
}
