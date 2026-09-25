import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../services/api'
import ProductCard from '../components/ProductCard'

export default function Catalog() {
  const [products, setProducts] = useState([])
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(searchParams.get('cat') || 'Todos')
  const [sort, setSort] = useState('default')
  const [maxPrice, setMaxPrice] = useState(500)

  useEffect(() => {
    api.get('/products').then(r => setProducts(r.data))
  }, [])

  const filtered = useMemo(() => {
    let list = products.filter(p =>
      (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())) &&
      (category === 'Todos' || p.category === category) &&
      Number(p.price) <= maxPrice
    )
    if (sort === 'low') list.sort((a,b) => Number(a.price)-Number(b.price))
    if (sort === 'high') list.sort((a,b) => Number(b.price)-Number(a.price))
    if (sort === 'name') list.sort((a,b) => a.name.localeCompare(b.name))
    return list
  }, [products, search, category, sort, maxPrice])

  const clear = () => {
    setSearch('')
    setCategory('Todos')
    setSort('default')
    setMaxPrice(500)
  }

  return <main>
    <section className="page-hero"><div className="container"><span className="eyebrow">FERRETERÍA GUILLERMO</span><h1>Catálogo de productos</h1><p>Encuentra productos por nombre, categoría o precio.</p></div></section>
    <section className="section container">
      <div className="catalog-toolbar">
        <div className="search-box">🔎<input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar producto..." /></div>
        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option>Todos</option><option>Herramientas</option><option>Electricidad</option><option>Pintura</option><option>Construcción</option>
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)}>
          <option value="default">Ordenar</option><option value="low">Precio menor</option><option value="high">Precio mayor</option><option value="name">Nombre A-Z</option>
        </select>
      </div>
      <div className="catalog-layout">
        <aside className="filter-panel">
          <h3>Filtrar</h3><label>Precio máximo</label>
          <input type="range" min="10" max="500" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
          <div className="range-values"><span>S/ 10</span><b>S/ {maxPrice}</b></div>
          <hr/><p className="muted">Selecciona un producto para agregarlo a tu cotización.</p>
        </aside>
        <div>
          <div className="result-line"><span>{filtered.length} producto{filtered.length === 1 ? '' : 's'}</span><button className="text-link" onClick={clear}>Limpiar filtros</button></div>
          <div className="product-grid">{filtered.map(p => <ProductCard key={p.id} product={p} />)}</div>
        </div>
      </div>
    </section>
  </main>
}
