import React from 'react'

export default function Cart({ items, onUpdateQuantity, onUpdateDiscount, onRemove }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
        <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
        <p className="text-lg font-medium">Carrito vacio</p>
        <p className="text-sm mt-1">Busca un producto o escanea un codigo</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-100">
      {items.map((item, index) => {
        const qty = parseFloat(item.quantity)
        const price = parseFloat(item.unit_price)
        const discount = parseFloat(item.discount)
        const lineTotal = (qty * price - discount).toFixed(2)

        return (
          <div key={item.product_id} className="p-3 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{item.product_name}</p>
                <p className="text-xs text-gray-500">{item.sku} | ${price.toFixed(2)} c/u</p>
              </div>
              <button
                className="text-gray-400 hover:text-red-500 ml-2 transition-colors"
                onClick={() => onRemove(item.product_id)}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1">
                <button
                  className="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg font-bold"
                  onClick={() => onUpdateQuantity(item.product_id, (qty - 1).toFixed(4))}
                >
                  -
                </button>
                <input
                  type="number"
                  className="w-14 text-center text-sm border border-gray-200 rounded py-1"
                  value={qty}
                  onChange={e => onUpdateQuantity(item.product_id, parseFloat(e.target.value || 0).toFixed(4))}
                  min="0"
                  step="1"
                />
                <button
                  className="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg font-bold"
                  onClick={() => onUpdateQuantity(item.product_id, (qty + 1).toFixed(4))}
                >
                  +
                </button>
              </div>

              <span className="font-bold text-gray-900">${lineTotal}</span>
            </div>

            {discount > 0 && (
              <p className="text-xs text-red-500 mt-1">Descuento: -${discount.toFixed(2)}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
