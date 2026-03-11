const productos = [
    { nombre: "Tomate", cantidad: 5, dias: 20, urgencia: "urgencia-roja" },
    { nombre: "Repuesto Freno", cantidad: 2, dias: 5, urgencia: "urgencia-verde" }
];

// Abrir/Cerrar Modal
function abrirModal() { document.getElementById('modal-agregar').style.display = 'block'; }
function cerrarModal() { document.getElementById('modal-agregar').style.display = 'none'; }

// Guardar producto nuevo
function guardarProducto() {
    const nombre = document.getElementById('nuevo-nombre').value;
    const stock = document.getElementById('nuevo-stock').value;

    if (nombre && stock) {
        // Creamos el nuevo objeto
        productos.push({ 
            nombre: nombre, 
            cantidad: stock, 
            urgencia: 'urgencia-verde' // Por defecto
        });
        
        cerrarModal();
        renderizarLista(); // Volvemos a pintar la lista con el nuevo item
    }
}

// Función para el botón "-" (Usar stock)
function usarStock(nombre) {
    const p = productos.find(item => item.nombre === nombre);
    if (p && p.cantidad > 0) {
        p.cantidad--;
        renderizarLista();
    }
}

function renderizarLista() {
    const contenedor = document.getElementById('lista-inventario');
    contenedor.innerHTML = productos.map(p => `
        <div class="item ${p.urgencia}">
            <div>
                <strong>${p.nombre}</strong><br>
                <span>Stock: ${p.cantidad}</span>
            </div>
            <button onclick="usarStock('${p.nombre}')">- Usar</button>
        </div>
    `).join('');
}

renderizarLista();