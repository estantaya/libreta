// Archivo: app.js by estantaya
// Fecha: 2026-03-11

// Variable para saber si tenemos conexión
let estaEnLinea = navigator.onLine;

window.addEventListener('online', () => {
    estaEnLinea = true;
    sincronizarConNube(); // Automático al recuperar internet
});

window.addEventListener('offline', () => {
    estaEnLinea = false;
    console.log("Modo Offline: Guardando localmente");
});

async function guardarProducto(producto) {
    // 1. Siempre guardamos local primero (para velocidad instantánea)
    let inventarioLocal = JSON.parse(localStorage.getItem('inventario')) || [];
    inventarioLocal.push(producto);
    localStorage.setItem('inventario', JSON.stringify(inventarioLocal));

    // 2. Intentamos guardar en la nube si hay conexión
    if (estaEnLinea) {
        try {
            await fetch('/.netlify/functions/GuardarProducto', {
                method: 'POST',
                body: JSON.stringify(producto)
            });
            console.log("Sincronizado con la nube");
        } catch (e) {
            console.error("Fallo al sincronizar, se quedará local");
        }
    } else {
        console.log("Sin internet: pendiente de sincronización");
    }
}

// Guardar producto nuevo
function guardarProducto() {
    const nombre = document.getElementById('nuevo-nombre').value;
    const stock = document.getElementById('nuevo-stock').value;
    
    if (nombre && stock) {
        const nuevoProducto = { 
            nombre, 
            cantidad: parseInt(stock), 
            fecha: new Date(), 
            urgencia: 'urgencia-verde' 
        };
        
        productos.push(nuevoProducto);
        // Guardamos en la memoria del navegador
        localStorage.setItem('inventarioLibreta', JSON.stringify(productos));
        
        cerrarModal();
        renderizarLista();
    }
}

// Actualizamos el array para incluir la fecha
const productos = [
    { nombre: "Tomate", cantidad: 5, fecha: new Date('2026-03-01'), urgencia: "urgencia-roja" },
    { nombre: "Repuesto Freno", cantidad: 2, fecha: new Date('2026-03-10'), urgencia: "urgencia-verde" }
];

const guardados = localStorage.getItem('inventarioLibreta');
if (guardados) {
    productos.push(...JSON.parse(guardados));
}

function renderizarLista() {
    // Ordenar: el más viejo (menor fecha) primero
    productos.sort((a, b) => a.fecha - b.fecha);

    const contenedor = document.getElementById('lista-inventario');
    contenedor.innerHTML = productos.map(p => `
        <div class="item ${p.urgencia}">
            <div>
                <strong>${p.nombre}</strong><br>
                <span>Stock: ${p.cantidad} | Ingreso: ${p.fecha.toLocaleDateString()}</span>
            </div>
            <button onclick="usarStock('${p.nombre}')">- Usar</button>
        </div>
    `).join('');
}

// Abrir/Cerrar Modal
function abrirModal() { document.getElementById('modal-agregar').style.display = 'block'; }
function cerrarModal() { document.getElementById('modal-agregar').style.display = 'none'; }

// Función para el botón "-" (Usar stock)
function usarStock(nombre) {
    const p = productos.find(item => item.nombre === nombre);
    if (p && p.cantidad > 0) {
        p.cantidad--;
        renderizarLista();
    }
}

renderizarLista();