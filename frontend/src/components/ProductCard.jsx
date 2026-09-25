import { useCart } from '../context/CartContext'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()

  return (
    <article className="product-card">
      <div className="product-image">
        {product.icon}
        {product.oldPrice && <span className="discount">OFERTA</span>}
      </div>
      <div className="product-body">
        <span className="product-category">{product.category}</span>
        <h3>{product.name}</h3>
        <div className="product-rating">★★★★★ <span>{product.rating}</span></div>
        <div className="product-price">
          <strong>S/ {Number(product.price).toFixed(2)}</strong>
          {product.oldPrice && <del>S/ {Number(product.oldPrice).toFixed(2)}</del>}
        </div>
        <button className="btn btn-primary" onClick={() => addToCart(product)}>
          Agregar a cotización
        </button>
      </div>
    </article>
  )
}
