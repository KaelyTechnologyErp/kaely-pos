# KaelyTech POS — Desktop Application

Aplicacion de Punto de Venta nativa para Windows, macOS y Linux. Construida con [Wails v2](https://wails.io/) (Go backend + React frontend).

## Requisitos

- Go 1.22+
- Node.js 20+
- Wails CLI: `go install github.com/wailsapp/wails/v2/cmd/wails@latest`
- kaely-agent corriendo en localhost:3000

## Desarrollo

```bash
# Instalar dependencias del frontend
cd frontend && npm install && cd ..

# Ejecutar en modo desarrollo (hot-reload)
wails dev
```

## Compilar

```bash
# Windows
wails build -platform windows/amd64

# macOS
wails build -platform darwin/amd64

# Linux
wails build -platform linux/amd64
```

El binario se genera en `build/bin/`.

## Arquitectura

```
kaely-pos (Wails Desktop)
    |
    |-- React + Tailwind (UI)
    |      |-- LoginScreen (PIN numpad / user+password)
    |      |-- ShiftScreen (abrir/continuar turno)
    |      |-- POSScreen (buscar productos, carrito, cobrar)
    |      |      |-- ProductSearch (busqueda + barcode scanner)
    |      |      |-- Cart (items, cantidad, descuento)
    |      |      |-- PaymentModal (efectivo/tarjeta/transferencia/puntos, pago mixto)
    |      |      |-- ShiftCloseModal (cierre con conteo de caja)
    |      |-- StatusBar (sync status, usuario, turno)
    |
    |-- Go Backend (app.go)
    |      |-- Login / PinLogin / Logout
    |      |-- SearchProducts / GetProductByBarcode
    |      |-- CreateSale / GetSales / CancelSale
    |      |-- OpenShift / CloseShift / GetCurrentShift
    |      |-- SearchCustomers / GetCustomerBalance
    |      |-- CreateExpense
    |      |-- GetHealth / GetSyncStatus
    |
    |-- HTTP Client → kaely-agent (localhost:3000)
```

## Atajos de Teclado

| Tecla | Accion |
|---|---|
| F2 | Enfocar busqueda de productos |
| F9 | Abrir modal de pago |
| F12 | Cerrar turno |
| Esc | Cerrar modal / limpiar |
| Enter | Seleccionar producto unico en busqueda |
