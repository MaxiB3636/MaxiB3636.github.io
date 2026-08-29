// IMPORTAMOS TODAS LAS FUNCIONALIDADES DEL ARCHIVO UTILS.JS
import { mostrarToast, guardarCarrito, recuperarCarrito, armarFilaCarrito } from "./utils.js"
// IMPORTAMOS SUPABASE DESDE EL CDN OFICIAL
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// ==========================================
// CONFIGURACIÓN DE SUPABASE
// ==========================================
const SUPABASE_URL = 'https://rdknlfqrjipffhtrgytn.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJka25sZnFyamlwZmZodHJneXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5NDMzNjcsImV4cCI6MjEwMzUxOTM2N30.LqOTD2A39E1wHoAiNo8lSIX-GLIHQ-PINqvv8un0GqA'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const spanVolver = document.querySelector('div.back-link')
const tableBody = document.querySelector('table tbody#cartBody')
const pTotalCarrito = document.querySelector('p#totalAmount')
const buttonCheckout = document.querySelector('button#buttonFinalizarCompra')
const buttonVaciar = document.querySelector('button#buttonVaciarCarrito') 
const carrito = recuperarCarrito()

// Categorías que participan de la promoción x10 y pallet (excluyendo el bidón de 10lt que no tiene promo)
const categoriasPromoX10 = [
    'gaseosas 3lt', 
    'gaseosas 2,25lt', 
    'gaseosas 2,25lt sin azúcar', 
    'gaseosas 600ml', 
    'agua saborizada placer 500ml', 
    'jugo de frutas pindapoy 1lt', 
    'jugo de frutas pindapoy 200ml', 
    'jugos', 
    'agua mineral', 
    'sodas'
];

// IDs específicos de vinos que participan de la promoción combinada de cajas (Clásico, Patero, Carlón, Tardío)
const idsVinosPromoCajas = ["50", "51", "52", "53"];

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
                
                if (carrito.length === 0) {
                    location.href = 'index.html';
                    return;
                }

                const resultado = calcularTotalYComision();
                pTotalCarrito.textContent = `$ ${resultado.total}`;
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
        const resultado = calcularTotalYComision();
        pTotalCarrito.textContent = `$ ${resultado.total}`;
    } else {
        location.href = 'index.html'
    }
}

// Función centralizada que calcula subtotales, precios escalonados y la comisión interna
function calcularTotalYComision() {
    if (!carrito || carrito.length === 0) {
        return { total: "0,00", comision: "0,00", porcentajeAplicado: "6%" };
    }

    let cantidadProductosPromo = carrito.filter(producto => {
        if (producto.id === "45") return false; 
        const cat = producto.categoria ? producto.categoria.toLowerCase() : '';
        return categoriasPromoX10.includes(cat);
    }).length;

    let cantidadCajasVinosPromo = carrito.filter(producto => {
        return idsVinosPromoCajas.includes(producto.id);
    }).length;

    let totalNumerico = 0;
    let porcentajeComision = 0.06; // 6% por defecto

    if (cantidadProductosPromo >= 60 || cantidadCajasVinosPromo >= 10) {
        porcentajeComision = 0.02; 
    } else if (cantidadProductosPromo >= 10 || cantidadCajasVinosPromo >= 3) {
        porcentajeComision = 0.04; 
    }

    carrito.forEach(producto => {
        const cat = producto.categoria ? producto.categoria.toLowerCase() : '';
        const esPromoValida = categoriasPromoX10.includes(cat) && producto.id !== "45";
        const esVinoPromo = idsVinosPromoCajas.includes(producto.id);

        let precioFinalItem = producto.precio;

        if (esPromoValida) {
            if (cantidadProductosPromo >= 60 && producto.precioPallet) {
                precioFinalItem = producto.precioPallet;
            } else if (cantidadProductosPromo >= 10 && producto.precioX10) {
                precioFinalItem = producto.precioX10;
            }
        } else if (esVinoPromo) {
            if (cantidadCajasVinosPromo >= 10 && producto.precioX10Cajas) {
                precioFinalItem = producto.precioX10Cajas;
            } else if (cantidadCajasVinosPromo >= 6 && producto.precioX6Cajas) {
                precioFinalItem = producto.precioX6Cajas;
            } else if (cantidadCajasVinosPromo >= 3 && producto.precioX3Cajas) {
                precioFinalItem = producto.precioX3Cajas;
            } else {
                precioFinalItem = producto.precio;
            }
        } else {
            precioFinalItem = producto.precio;
        }

        totalNumerico += precioFinalItem;
    });

    let comisionCalculada = totalNumerico * porcentajeComision;

    return {
        total: totalNumerico.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        comision: comisionCalculada.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        porcentajeAplicado: `${porcentajeComision * 100}%`
    };
}

// Función Principal
cargarCarritoDeCompras()

// Eventos

// 1. Evento para vaciar el carrito
buttonVaciar.addEventListener('click', () => {
    if (carrito.length === 0) {
        mostrarToast('info', 'El carrito ya está vacío');
        return;
    }

    Swal.fire({
        title: '¿Vaciar carrito?',
        text: 'Se eliminarán todos los productos agregados',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, vaciar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('carrito');
            carrito.length = 0;
            mostrarToast('info', 'El carrito ha sido vaciado');
            setTimeout(() => {
                location.href = 'index.html';
            }, 800);
        }
    });
});

// 2. Evento para finalizar compra, guardar en Supabase y armar mensaje de WhatsApp
buttonCheckout.addEventListener('click', async ()=> {
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
        confirmButtonText: "Continuار a WhatsApp",
        cancelButtonText: "Cancelar",
        preConfirm: () => {
            const nombre = document.getElementById('swal-nombre').value;
            const telefono = document.getElementById('swal-telefono').value;
            const local = document.getElementById('swal-local').value;
            const direccion = document.getElementById('swal-direccion').value;
            const dia = document.getElementById('swal-dia').value;
            const horario = document.getElementById('swal-horario').value;

            if (!nombre || !telefono || !local || !direccion || !dia || !horario) {
                Swal.showValidationMessage('Por favor completa todos los campos');
            }
            return { nombre, telefono, local, direccion, dia, horario };
        }
    });

    if (datosCliente) {
        const datosCalculados = calcularTotalYComision();
        let totalArticulos = carrito.length;

        const productosAgrupados = {};
        carrito.forEach(producto => {
            if (productosAgrupados[producto.id]) {
                productosAgrupados[producto.id].cantidad += 1;
            } else {
                const esVino = producto.categoria && producto.categoria.toLowerCase() === 'vinos';
                productosAgrupados[producto.id] = {
                    nombre: producto.nombre,
                    cantidad: 1,
                    unidadMedida: esVino ? 'Caja/s' : 'Pack/s'
                };
            }
        });

        // Generamos la fecha exacta para Argentina en formato seguro compatible con bases de datos
        const options = { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        const formatter = new Intl.DateTimeFormat('en-CA', options);
        const partes = formatter.formatToParts(new Date());
        const fechaArgentina = `${partes.find(p => p.type === 'year').value}-${partes.find(p => p.type === 'month').value}-${partes.find(p => p.type === 'day').value}T${partes.find(p => p.type === 'hour').value}:${partes.find(p => p.type === 'minute').value}:${partes.find(p => p.type === 'second').value}`;

        // Preparamos los datos formateados para guardar en la base de datos
        const nuevaVenta = {
            fecha: fechaArgentina,
            cliente: datosCliente.nombre,
            telefono: datosCliente.telefono,
            local: datosCliente.local,
            direccion: datosCliente.direccion,
            total_venta: `$ ${datosCalculados.total}`,
            comision_ganada: `$ ${datosCalculados.comision}`,
            porcentaje_aplicado: datosCalculados.porcentajeAplicado,
            productos: Object.values(productosAgrupados)
        };

        // Guardamos en Supabase
        const { error } = await supabase.from('ventas').insert([nuevaVenta]);

        if (error) {
            console.error("Error al guardar la venta en Supabase:", error.message);
            mostrarToast('error', 'Error al registrar la venta. Revisa la consola.');
            return; 
        }

        // Armamos el mensaje para WhatsApp
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
            mensaje += `- ${item.cantidad} ${item.unidadMedida} de ${item.nombre}%0A`;
        });

        const numeroWhatsApp = "5492262558819"; 
        const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensaje}`;
        window.open(urlWhatsApp, '_blank');

        localStorage.removeItem('carrito');
        carrito.length = 0;
        location.href = 'index.html';
    }
})

spanVolver.addEventListener('click', ()=> location.href = 'index.html' )