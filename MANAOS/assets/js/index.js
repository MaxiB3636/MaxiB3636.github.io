// IMPORT MODULES
import { arrayCategorias, recuperarCarrito, guardarCarrito, mostrarToast, 
         retornarSpanCategoria, crearCardHTMLError, crearCardProducto } from "./utils.js"

// DECLARAR VARIABLES, CONSTANTES Y ENLACES AL DOM HTML
const btnCarrito = document.querySelector('div.checkout-header')
const inputSearch = document.querySelector('input#inputSearch')
const divContenedor = document.querySelector('div.products-container')
const divContainerCategorias = document.querySelector('div.container-categories')
const urlProductos = 'assets/js/productos.json'
const arrayProductos = []
const carrito = recuperarCarrito()

function cargarCategorias() {
    if (arrayCategorias.length > 0) {
        for (let categoria of arrayCategorias) {
            divContainerCategorias.append(retornarSpanCategoria(categoria))
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
            categoria.addEventListener('click', ()=> {
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
                carrito.push(productoSeleccionado)
                guardarCarrito(carrito)
                mostrarToast('success', 'Producto agregado al carrito.')
            })
        }
    }
}

// FUNCIÓN PRINCIPAL
cargarCategorias()
obtenerProductos()

// EVENTOS (aquellos elementos que tendrán un evento definido)
inputSearch.addEventListener('search', ()=> {
    let textoAbuscar = inputSearch.value.toLowerCase()
    if (textoAbuscar !== '') {
        const productosFiltrados = arrayProductos.filter((producto)=> producto.nombre.toLowerCase().includes(textoAbuscar) )

        if (productosFiltrados.length > 0) {
            cargarProductos(productosFiltrados)
        } else {
            mostrarToast('warning', 'No se encontraron productos con el texto: ' + textoAbuscar)
        }
    }
})

btnCarrito.addEventListener('click', ()=> location.href = 'checkout.html' )