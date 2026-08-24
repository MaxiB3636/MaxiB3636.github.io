export const arrayCategorias = ['Todos los Productos', 'gaseosas 3LT', 'gaseosas 600ML', 'gaseosas 2,25LT', 'AGUA SABORIZADA PLACER 500ML', 'JUGO DE FRUTAS PINDAPOY 200ML', 'JUGO DE FRUTAS PINDAPOY 1LT', 'AGUA MINERAL', 'SODAS', 'VINOS', 'PETACAS', 'JUGOS', 'CERVEZAS']

export function mostrarToast(icono, texto) {
    Swal.fire({
        toast: true,
        position: "top-end",
        theme: 'dark',
        showConfirmButton: false,
        timerProgressBar: true,
        timer: 3000,
        text: texto,
        icon: icono
    })
}

export function guardarCarrito(carrito) {
    localStorage.setItem('carrito', JSON.stringify(carrito) )
}

export function recuperarCarrito() {
    const carritoRecuperado = JSON.parse( localStorage.getItem('carrito') )

    if (!carritoRecuperado) {
        return []
    } else {
        return carritoRecuperado
    }
}

export function armarFilaCarrito(producto) {
    return `<tr>
                <td class="product-image">
                    <img src="${producto.imagen}" alt="${producto.nombre}">
                </td>
                <td class="product-name">${producto.nombre}</td>
                <td class="product-price">$ ${producto.precio.toLocaleString('es-AR')}</td>
                <td class="product-delete" id="${producto.id}">
                    <span class="product-delete material-symbols-outlined">
                        delete
                    </span>
                </td>
            </tr>`
}

export function retornarSpanCategoria(cate) {
    const spanCategoria = document.createElement('span')
    spanCategoria.className = 'category-tag'
    spanCategoria.id = cate.toLowerCase()
    spanCategoria.textContent = cate.toUpperCase()

    return spanCategoria
}

export function crearCardHTMLError() {
    return `<div class="card error">
                <div class="card-icon-image">🔌</div>
                <div class="card-error-title"><h2>Se ha producido un error</h2></div>
                <div class="card-error-detail">No se pudo acceder al listado de productos. Intenta nuevamente en unos instantes.</div>
            </div>`
}

export function crearCardProducto(producto) {
    return `<div class="card">
                <div class="card-icon-image">
                    <img src="${producto.imagen}" alt="${producto.nombre}">
                </div>
                <div class="card-product-title">${producto.nombre}</div>
                <div class="card-product-price">$ ${producto.precio.toLocaleString('es-AR')}</div>
                <button class="card-button-buy" id="${producto.id}">
                    Comprar
                </button>
            </div>`
}