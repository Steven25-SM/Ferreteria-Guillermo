const PRODUCTS=[
{id:1,name:'Taladro Percutor 650W',category:'Herramientas',price:189.90,oldPrice:229.90,icon:'🔨',rating:4.8,featured:true},
{id:2,name:'Set Profesional 108 piezas',category:'Herramientas',price:129.90,oldPrice:159.90,icon:'🧰',rating:4.9,featured:true},
{id:3,name:'Cable Eléctrico 100m',category:'Electricidad',price:89.90,oldPrice:99.90,icon:'🔌',rating:4.7,featured:true},
{id:4,name:'Pintura Látex 4L',category:'Pintura',price:49.90,oldPrice:59.90,icon:'🎨',rating:4.6,featured:true},
{id:5,name:'Martillo Profesional',category:'Herramientas',price:39.90,icon:'🔨',rating:4.8},
{id:6,name:'Interruptor Doble',category:'Electricidad',price:12.90,icon:'💡',rating:4.5},
{id:7,name:'Cemento Tipo I',category:'Construcción',price:32.90,icon:'🧱',rating:4.7},
{id:8,name:'Brocha 4 pulgadas',category:'Pintura',price:15.90,icon:'🖌️',rating:4.6},
{id:9,name:'Alicate Universal',category:'Herramientas',price:24.90,icon:'🗜️',rating:4.5},
{id:10,name:'Tomacorriente Doble',category:'Electricidad',price:18.90,icon:'🔌',rating:4.6},
{id:11,name:'Rodillo para Pintura',category:'Pintura',price:22.90,icon:'🖌️',rating:4.4},
{id:12,name:'Ladrillo King Kong',category:'Construcción',price:2.90,icon:'🧱',rating:4.7}
];
function productCard(p){return `<article class="product-card"><div class="product-image">${p.icon}${p.oldPrice?'<span class="discount">OFERTA</span>':''}</div><div class="product-body"><span class="product-category">${p.category}</span><h3>${p.name}</h3><div class="product-rating">★★★★★ <span>${p.rating}</span></div><div class="product-price"><strong>S/ ${p.price.toFixed(2)}</strong>${p.oldPrice?`<del>S/ ${p.oldPrice.toFixed(2)}</del>`:''}</div><button class="btn btn-primary" onclick="addToCart(${p.id})">Agregar a cotización</button></div></article>`}
function renderFeatured(){const e=document.getElementById('featuredProducts');if(e)e.innerHTML=PRODUCTS.filter(p=>p.featured).map(productCard).join('')}
function renderCatalog(){const grid=document.getElementById('catalogProducts');if(!grid)return;const search=document.getElementById('searchInput'),cat=document.getElementById('categoryFilter'),sort=document.getElementById('sortFilter'),range=document.getElementById('priceFilter'),value=document.getElementById('priceValue');const params=new URLSearchParams(location.search);if(params.get('cat'))cat.value=params.get('cat');function run(){let list=PRODUCTS.filter(p=>{const q=(search.value||'').toLowerCase();return(!q||p.name.toLowerCase().includes(q)||p.category.toLowerCase().includes(q))&&(cat.value==='Todos'||p.category===cat.value)&&p.price<=Number(range.value)});if(sort.value==='low')list.sort((a,b)=>a.price-b.price);if(sort.value==='high')list.sort((a,b)=>b.price-a.price);if(sort.value==='name')list.sort((a,b)=>a.name.localeCompare(b.name));grid.innerHTML=list.map(productCard).join('');document.getElementById('resultCount').textContent=`${list.length} producto${list.length===1?'':'s'}`;value.textContent=`S/ ${range.value}`}[search,cat,sort,range].forEach(e=>e.addEventListener('input',run));document.getElementById('clearFilters').onclick=()=>{search.value='';cat.value='Todos';sort.value='default';range.value=500;run()};run()}
document.addEventListener('DOMContentLoaded',()=>{renderFeatured();renderCatalog()});
