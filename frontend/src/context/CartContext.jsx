import { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext(null)
const KEY = 'fg_cart'

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(readCart)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(cart))
  }, [cart])

  const addToCart = product => {
    setCart(current => {
      const found = current.find(p => p.id === product.id)
      if (found) return current.map(p => p.id === product.id ? { ...p, qty: p.qty + 1 } : p)
      return [...current, { ...product, qty: 1 }]
    })
  }

  const changeQty = (id, amount) => {
    setCart(current =>
      current
        .map(p => p.id === id ? { ...p, qty: p.qty + amount } : p)
        .filter(p => p.qty > 0)
    )
  }

  const removeItem = id => setCart(current => current.filter(p => p.id !== id))
  const clearCart = () => setCart([])
  const count = cart.reduce((sum, p) => sum + p.qty, 0)
  const total = cart.reduce((sum, p) => sum + Number(p.price) * p.qty, 0)

  return (
    <CartContext.Provider value={{ cart, count, total, addToCart, changeQty, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
