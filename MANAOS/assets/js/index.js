// IMPORT MODULES
import { arrayCategorias, recuperarCarrito, guardarCarrito, mostrarToast, 
         retornarSpanCategoria, crearCardHTMLError, crearCardProducto } from "./utils.js"

// DECLARAR VARIABLES, CONSTANTES Y ENLACES AL DOM HTML
const btnCarrito = document.querySelector('div.checkout-header')
const spanCounter = document.querySelector('span#cart-counter')
const inputSearch = document.querySelector('input#inputSearch')
const divContenedor = document.querySelector('div.products-container')
const divContainerCategorias = document.querySelector('div.container-categories')
const urlProductos = 'assets/js/productos.json'
const arrayProductos = []
const carrito = recuperarCarrito()

function actualizarContadorCarrito() {
    if (spanCounter) {
        spanCounter.textContent = carrito.length
    }
}

function cargarCategorias() {
    if (arrayCategorias.length > 0) {
        for (let categoria of arrayCategorias) {
            const spanCat = retornarSpanCategoria(categoria)
            // Opcional: Dejar seleccionada por defecto la categoría "Todos los productos" al iniciar
            if (categoria.toLowerCase() === 'todos los productos') {
                spanCat.classList.add('active')
            }
            divContainerCategorias.append(spanCat)
        }
        activarClickEnCategorias()
    }
}

function cargarProductos(array) {
    divContenedor.innerHTML = ""

    if (array.length > 0) {
        for (let producto of array) {
            divContenedor.innerHTML += crearCardProducto(producto)
        }
        activarClickBotonesComprar()
    }
}

async function obtenerProductos() {
    try {
        const response = await fetch(urlProductos)
        if (response.ok) {
            const data = await response.json()
            arrayProductos.push(...data)
            cargarProductos(arrayProductos)
        } else {
            throw new Error('Error al intentar obtener los productos.')
        }
    } catch (error) {
        divContenedor.innerHTML = crearCardHTMLError()
    }
}

function activarClickEnCategorias() {
    const spanCategorias = document.querySelectorAll('span.category-tag')

    if (spanCategorias.length > 0) {
        for (let categoria of spanCategorias) {
            categoria.addEventListener('click', (e)=> {
                // 1. Quitamos la clase 'active' de todas las categorías
                spanCategorias.forEach(cat => cat.classList.remove('active'))

                // 2. Se la agregamos a la que hizo clic el usuario
                e.target.classList.add('active')

                let cate = categoria.textContent.toLowerCase()

                if (cate === 'todos los productos') {
                    cargarProductos(arrayProductos)
                    return 
                }

                const productosFiltrados = arrayProductos.filter((producto)=> producto.categoria === cate )

                if (productosFiltrados.length > 0) {
                    cargarProductos(productosFiltrados)
                } else {
                    alert('No se encontraron productos en esta categoria.')
                }
            })
        }
    }
}

function activarClickBotonesComprar() {
    const botonesComprar = document.querySelectorAll('button.card-button-buy')

    if (botonesComprar.length > 0) {
        for (let botonComprar of botonesComprar) {
            botonComprar.addEventListener('click', ()=> {
                const productoSeleccionado = arrayProductos.find((producto)=> producto.id === botonComprar.id )
                
                const inputCantidad = document.querySelector(`input#qty-${botonComprar.id}`)
                const cantidad = parseInt(inputCantidad.value)

                if (cantidad > 0 && cantidad <= 60) {
                    for (let i = 0; i < cantidad; i++) {
                        carrito.push(productoSeleccionado)
                    }

                    guardarCarrito(carrito)
                    actualizarContadorCarrito()
                    
                    inputCantidad.value = 1
                    mostrarToast('success', `Se agregaron ${cantidad} unidad(es) al carrito.`)
                } else {
                    mostrarToast('warning', 'Podés agregar un máximo de 60 unidades de este producto por vez.')
                }
            })
        }
    }
}

// FUNCIÓN PRINCIPAL
cargarCategorias()
obtenerProductos()
actualizarContadorCarrito()

// EVENTOS (búsqueda en tiempo real)
inputSearch.addEventListener('input', ()=> {
    let textoAbuscar = inputSearch.value.trim().toLowerCase()

    if (textoAbuscar === '') {
        cargarProductos(arrayProductos)
        return
    }

    const productosFiltrados = arrayProductos.filter((producto)=> 
        producto.nombre.toLowerCase().includes(textoAbuscar)
    )

    if (productosFiltrados.length > 0) {
        cargarProductos(productosFiltrados)
    } else {
        divContenedor.innerHTML = `<div class="card error"><div class="card-icon-image">🔌</div><div class="card-error-title"><h2>Sin resultados</h2></div><div class="card-error-detail">No se encontraron productos para "${textoAbuscar}".</div></div>`
    }
})

btnCarrito.addEventListener('click', ()=> location.href = 'checkout.html' )