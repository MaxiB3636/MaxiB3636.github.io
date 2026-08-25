// IMPORTAMOS TODAS LAS FUNCIONALIDADES DEL ARCHIVO UTILS.JS
import { mostrarToast, guardarCarrito, recuperarCarrito, armarFilaCarrito } from "./utils.js"

const spanVolver = document.querySelector('div.back-link')
const tableBody = document.querySelector('table tbody#cartBody')
const pTotalCarrito = document.querySelector('p#totalAmount')
const buttonCheckout = document.querySelector('button#buttonFinalizarCompra')
const carrito = recuperarCarrito()

// Funciones de lógica
function activarClickQuitarProducto() {
    const botonesDelete = document.querySelectorAll('td.product-delete')
    if (botonesDelete.length > 0) {
        botonesDelete.forEach((botonDelete)=> {
            botonDelete.addEventListener('click', ()=> {
                const idx = carrito.findIndex((prod)=> prod.id === botonDelete.id )
                carrito.splice(idx, 1)
                guardarCarrito(carrito)
                const fila = botonDelete.parentElement
                fila.remove()
                mostrarToast('info', 'Producto quitado del carrito')
                pTotalCarrito.textContent = `$ ${calcularTotalCarrito()}`
            })
        })
    }
}

function cargarCarritoDeCompras() {
    if (carrito.length > 0) {
        tableBody.innerHTML = ''

        carrito.forEach((producto)=> {
            tableBody.innerHTML += armarFilaCarrito(producto)
        })
        activarClickQuitarProducto()
        pTotalCarrito.textContent = `$ ${calcularTotalCarrito()}`
    } else {
        location.href = 'index.html'
    }
}

function calcularTotalCarrito() {
    if (carrito.length > 0) {
        let total = carrito.reduce((acc, producto)=> acc + producto.precio, 0 )

        return total.toLocaleString('es-AR')
    }
}

// Función Principal
cargarCarritoDeCompras()

// Eventos
buttonCheckout.addEventListener('click', async ()=> {
    // 1. Mostrar formulario con SweetAlert2 incluyendo Teléfono y Apertura/Cierre
    const { value: datosCliente } = await Swal.fire({
        title: "Datos de Envío y Local",
        html: `
            <input id="swal-nombre" class="swal2-input" placeholder="Tu Nombre y Apellido">
            <input id="swal-telefono" class="swal2-input" placeholder="Número de Teléfono" type="tel">
            <input id="swal-local" class="swal2-input" placeholder="Nombre del Local">
            <input id="swal-direccion" class="swal2-input" placeholder="Dirección de entrega">
            <input id="swal-dia" class="swal2-input" placeholder="Día de entrega (ej: Mañana / Jueves)">
            <input id="swal-horario" class="swal2-input" placeholder="Horario (Apertura y Cierre, ej: 08:00 a 20:00 hs)">
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Continuar a WhatsApp",
        cancelButtonText: "Cancelar",
        preConfirm: () => {
            const nombre = document.getElementById('swal-nombre').value;
            const telefono = document.getElementById('swal-telefono').value;
            const local = document.getElementById('swal-local').value;
            const direccion = document.getElementById('swal-direccion').value;
            const dia = document.getElementById('swal-dia').value;
            const horario = document.getElementById('swal-horario').value;

            // Validación para asegurar que ningún campo quede vacío
            if (!nombre || !telefono || !local || !direccion || !dia || !horario) {
                Swal.showValidationMessage('Por favor completa todos los campos');
            }
            return { nombre, telefono, local, direccion, dia, horario };
        }
    });

    // Si el usuario completó los datos y confirmó
    if (datosCliente) {
        // 2. Calcular la cantidad total de artículos comprados
        let totalArticulos = carrito.length;

        // 3. Agrupar productos repetidos y contar sus cantidades
        const productosAgrupados = {};
        carrito.forEach(producto => {
            if (productosAgrupados[producto.id]) {
                productosAgrupados[producto.id].cantidad += 1;
            } else {
                productosAgrupados[producto.id] = {
                    nombre: producto.nombre,
                    cantidad: 1
                };
            }
        });

        // 4. Construir el mensaje completo para WhatsApp
        let mensaje = `PEDIDO.%0A%0A`;
        mensaje += `📍 *Dirección:* ${datosCliente.direccion}%0A`;
        mensaje += `👤 *Cliente:* ${datosCliente.nombre}%0A`;
        mensaje += `📱 *Teléfono:* ${datosCliente.telefono}%0A`;
        mensaje += `📦 *Cantidad total de artículos:* ${totalArticulos}%0A`;
        mensaje += `🏪 *Local:* ${datosCliente.local}%0A`;
        mensaje += `📅 *Día de entrega:* ${datosCliente.dia}%0A`;
        mensaje += `⏰ *Apertura y Cierre:* ${datosCliente.horario}%0A%0A`;
        mensaje += `*Detalle de productos:*%0A`;

        Object.values(productosAgrupados).forEach(item => {
            mensaje += `- ${item.cantidad} ${item.nombre}%0A`;
        });

        // 5. Tu número de WhatsApp (Reemplaza con tu número con código de país y área, sin símbolos)
        const numeroWhatsApp = "5492262558819"; 

        // 6. Abrir WhatsApp
        const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensaje}`;
        window.open(urlWhatsApp, '_blank');

        // 7. Limpiar carrito y redirigir
        localStorage.removeItem('carrito');
        carrito.length = 0;
        location.href = 'index.html';
    }
})

spanVolver.addEventListener('click', ()=> location.href = 'index.html' )