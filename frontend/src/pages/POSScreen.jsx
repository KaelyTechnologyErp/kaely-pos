import React, { useState, useRef, useEffect, useCallback } from 'react'
import ProductSearch from '../components/ProductSearch'
import Cart from '../components/Cart'
import PaymentModal from '../components/PaymentModal'
import ShiftCloseModal from '../components/ShiftCloseModal'

export default function POSScreen({ user, shift, onShiftClose }) {
  const [cart, setCart] = useState([])
  const [showPayment, setShowPayment] = useState(false)
  const [showShiftClose, setShowShiftClose] = useState(false)
  const [lastSale, setLastSale] = useState(null)
  const [customerID, setCustomerID] = useState('')
  const [customerName, setCustomerName] = useState('')
  const searchRef = useRef(null)

  // Keyboard shortcut: F2 = focus search, F9 = pay, F12 = close shift
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'F2') { e.preventDefault(); searchRef.current?.focus() }
      if (e.key === 'F9' && cart.length > 0) { e.preventDefault(); setShowPayment(true) }
      if (e.key === 'F12') { e.preventDefault(); setShowShiftClose(true) }
      if (e.key === 'Escape') { setShowPayment(false); setShowShiftClose(false) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [cart])

  const addToCart = useCallback((product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product_id === product.id)
      if (existing) {
        return prev.map(i =>
          i.product_id === product.id
            ? { ...i, quantity: (parseFloat(i.quantity) + 1).toFixed(4) }
            : i
        )
      }
      return [...prev, {
        product_id: product.id,
        product_name: product.name,
        sku: product.sku,
        quantity: '1.0000',
        unit_price: product.price,
        discount: '0.0000',
        tax_rate: product.tax_rate || '0.1600',
      }]
    })
  }, [])

  const updateQuantity = (productId, quantity) => {
    if (parseFloat(quantity) <= 0) {
      removeFromCart(productId)
      return
    }
    setCart(prev => prev.map(i =>
      i.product_id === productId ? { ...i, quantity } : i
    ))
  }

  const updateDiscount = (productId, discount) => {
    setCart(prev => prev.map(i =>
      i.product_id === productId ? { ...i, discount } : i
    ))
  }

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(i => i.product_id !== productId))
  }

  const clearCart = () => {
    setCart([])
    setCustomerID('')
    setCustomerName('')
    setLastSale(null)
  }

  const calculateTotals = () => {
    let subtotal = 0, tax = 0
    cart.forEach(item => {
      const lineTotal = parseFloat(item.quantity) * parseFloat(item.unit_price) - parseFloat(item.discount)
      const lineTax = lineTotal * parseFloat(item.tax_rate)
      subtotal += lineTotal
      tax += lineTax
    })
    return {
      subtotal: subtotal.toFixed(4),
      tax: tax.toFixed(4),
      total: (subtotal + tax).toFixed(4),
      items: cart.length,
    }
  }

  const handlePaymentComplete = async (payments) => {
    const request = JSON.stringify({
      customer_id: customerID,
      items: cart,
      payments: payments,
      currency: 'MXN',
    })

    try {
      const result = await window.go.main.App.CreateSale(request)
      if (result.success) {
        setLastSale(result)
        setShowPayment(false)
        clearCart()
      } else {
        alert('Error: ' + result.error)
      }
    } catch (e) {
      alert('Error de conexion: ' + e.message)
    }
  }

  const handleShiftClose = async (closingAmount) => {
    try {
      const result = await window.go.main.App.CloseShift(closingAmount)
      if (result.error) {
        alert('Error: ' + result.error)
      } else {
        setShowShiftClose(false)
        onShiftClose()
      }
    } catch (e) {
      alert('Error: ' + e.message)
    }
  }

  const totals = calculateTotals()

  return (
    <div className="h-full flex">
      {/* Left panel: Search + Products */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        <ProductSearch ref={searchRef} onProductSelect={addToCart} />

        {/* Quick actions bar */}
        <div className="flex gap-2 mt-3 mb-2">
          <button className="btn-secondary text-xs flex-1" onClick={clearCart}>
            Limpiar (Esc)
          </button>
          <button
            className="btn-success text-xs flex-1"
            onClick={() => setShowPayment(true)}
            disabled={cart.length === 0}
          >
            Cobrar (F9)
          </button>
          <button className="btn-secondary text-xs" onClick={() => setShowShiftClose(true)}>
            Cerrar turno (F12)
          </button>
        </div>

        {/* Last sale confirmation */}
        {lastSale && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg mb-2">
            <p className="text-sm font-medium text-emerald-800">
              Venta #{lastSale.sale_id?.slice(0, 8)} completada — ${parseFloat(lastSale.total).toFixed(2)}
            </p>
          </div>
        )}
      </div>

      {/* Right panel: Cart */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
        {/* Customer selector */}
        <div className="p-3 border-b border-gray-100">
          <input
            type="text"
            className="input-field text-sm"
            placeholder="Buscar cliente (opcional)..."
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
          />
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto">
          <Cart
            items={cart}
            onUpdateQuantity={updateQuantity}
            onUpdateDiscount={updateDiscount}
            onRemove={removeFromCart}
          />
        </div>

        {/* Totals */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal ({totals.items} items)</span>
              <span>${parseFloat(totals.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>IVA</span>
              <span>${parseFloat(totals.tax).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-2xl font-bold text-gray-900 pt-2 border-t">
              <span>Total</span>
              <span>${parseFloat(totals.total).toFixed(2)}</span>
            </div>
          </div>

          <button
            className="btn-primary w-full mt-4 text-lg py-3"
            disabled={cart.length === 0}
            onClick={() => setShowPayment(true)}
          >
            Cobrar ${parseFloat(totals.total).toFixed(2)}
          </button>
        </div>
      </div>

      {/* Modals */}
      {showPayment && (
        <PaymentModal
          total={totals.total}
          onComplete={handlePaymentComplete}
          onClose={() => setShowPayment(false)}
        />
      )}
      {showShiftClose && (
        <ShiftCloseModal
          shift={shift}
          onClose={() => setShowShiftClose(false)}
          onConfirm={handleShiftClose}
        />
      )}
    </div>
  )
}
