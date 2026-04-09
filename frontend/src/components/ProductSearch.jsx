import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react'

const ProductSearch = forwardRef(({ onProductSelect }, ref) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const debounceRef = useRef(null)

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }))

  const handleSearch = (value) => {
    setQuery(value)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (value.length < 2) {
      setResults([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        // Try barcode first (exact match)
        if (/^\d{8,13}$/.test(value)) {
          const product = await window.go.main.App.GetProductByBarcode(value)
          if (product && product.id) {
            onProductSelect(product)
            setQuery('')
            setResults([])
            setLoading(false)
            return
          }
        }

        // Text search
        const products = await window.go.main.App.SearchProducts(value)
        setResults(products || [])
      } catch {
        setResults([])
      }
      setLoading(false)
    }, 200)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && results.length === 1) {
      onProductSelect(results[0])
      setQuery('')
      setResults([])
    }
  }

  const selectProduct = (product) => {
    onProductSelect(product)
    setQuery('')
    setResults([])
    inputRef.current?.focus()
  }

  return (
    <div className="relative">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          className="input-field pl-10 text-lg"
          placeholder="Buscar producto, escanear codigo de barras... (F2)"
          value={query}
          onChange={e => handleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-kaely-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Search results dropdown */}
      {results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-lg shadow-xl border border-gray-200 max-h-80 overflow-y-auto">
          {results.map((product, i) => (
            <button
              key={product.id || i}
              className="w-full text-left px-4 py-3 hover:bg-kaely-50 border-b border-gray-100 last:border-0 flex justify-between items-center transition-colors"
              onClick={() => selectProduct(product)}
            >
              <div>
                <p className="font-medium text-gray-900">{product.name}</p>
                <p className="text-xs text-gray-500">
                  SKU: {product.sku}
                  {product.barcode && ` | ${product.barcode}`}
                  {product.stock && ` | Stock: ${product.stock}`}
                </p>
              </div>
              <span className="text-lg font-bold text-kaely-700">
                ${parseFloat(product.price || 0).toFixed(2)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
})

ProductSearch.displayName = 'ProductSearch'
export default ProductSearch
