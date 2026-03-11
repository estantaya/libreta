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

function eliminarProducto(nombre) {
    // Filtramos el array para excluir el producto seleccionado
    const index = productos.findIndex(p => p.nombre === nombre);
    if (index > -1) {
        productos.splice(index, 1);
        localStorage.setItem('inventarioLibreta', JSON.stringify(productos));
        renderizarLista();
    }
}

// Esta es la UNICA función necesaria para guardar
async function guardarProducto() {
    const nombre = document.getElementById('nuevo-nombre').value;
    const stock = document.getElementById('nuevo-stock').value;
    
    // Convertimos a número
    const cantidad = parseInt(stock); 
    
    if (nombre && !isNaN(cantidad)) {
        const nuevoProducto = { 
            id: Date.now(),
            nombre, 
            cantidad, // Ahora la variable 'cantidad' existe y tiene el valor correcto
            fecha: new Date(),
            sincronizado: false 
        };
        
        productos.push(nuevoProducto);
		renderizarLista();
		cerrarModal();
		
		// 2. Persistir localmente
		localStorage.setItem('inventarioLibreta', JSON.stringify(productos));
		
		// 3. Sincronizar a la nube (si hay conexión)
		if (navigator.onLine) {
			try {
				await fetch('/.netlify/functions/GuardarProducto', {
					method: 'POST',
					body: JSON.stringify(nuevoProducto)
				});
				console.log("Sincronizado con la nube");
			} catch (e) {
				console.error("Fallo al sincronizar con la nube, quedará local "+e);
			}
		} else {
			console.log("Modo Offline: Guardado solo localmente");
		}
    }
}

// Actualizamos el array para incluir la fecha
// Asegúrate de que no se repitan por nombre
const productos = [
    { nombre: "Tomate", cantidad: 5, fecha: new Date('2026-03-01'), urgencia: "urgencia-roja" },
    { nombre: "Repuesto Freno", cantidad: 2, fecha: new Date('2026-03-10'), urgencia: "urgencia-verde" }
];

// En lugar de hacer un push directo al array global, recarga desde cero:
const guardados = JSON.parse(localStorage.getItem('inventarioLibreta')) || [];

guardados.forEach(g => {
    if (!productos.find(p => p.nombre === g.nombre)) {
        productos.push(g);
    }
});

function renderizarLista() {
    // 1. Aseguramos que todas las fechas sean objetos Date reales
    productos.forEach(p => {
        if (!(p.fecha instanceof Date)) {
            p.fecha = new Date(p.fecha);
        }
    });

    // 2. Ordenar por fecha
    productos.sort((a, b) => a.fecha - b.fecha);
	

    const contenedor = document.getElementById('lista-inventario');
    
    // 3. Usamos map correctamente
	contenedor.innerHTML = productos.map(p => `
    <div class="item ${p.urgencia}">
        <div>
            <strong>${p.nombre}</strong><br>
            <span>Stock: ${p.cantidad} | Ingreso: ${p.fecha.toLocaleDateString()}</span>
        </div>
        <button onclick="sumarStock('${p.nombre}')">+</button>
        <button onclick="usarStock('${p.nombre}')">-</button>
        <button onclick="eliminarProducto('${p.nombre}')" style="color: red;">X</button>
    </div>
	`).join('');
	
	
}

function eliminarProducto(nombre) {
    // Filtramos el array para excluir el producto seleccionado
    const index = productos.findIndex(p => p.nombre === nombre);
    if (index > -1) {
        productos.splice(index, 1);
        localStorage.setItem('inventarioLibreta', JSON.stringify(productos));
        renderizarLista();
    }
}

// Abrir/Cerrar Modal
function abrirModal() { document.getElementById('modal-agregar').style.display = 'block'; }
function cerrarModal() { document.getElementById('modal-agregar').style.display = 'none'; }

// Función para el botón "-" (Usar stock)
function usarStock(nombre) {
    const p = productos.find(item => item.nombre === nombre);
    if (p && p.cantidad > 0) {
        p.cantidad--;
        p.sincronizado = false; // Marcamos como pendiente de sincronizar
        
        // ¡IMPORTANTE! Guardar en localStorage aquí
        localStorage.setItem('inventarioLibreta', JSON.stringify(productos));
        
        renderizarLista();
    }
}

function sumarStock(nombre) {
    const p = productos.find(item => item.nombre === nombre);
    if (p) {
        p.cantidad++; // Sumamos uno
        p.sincronizado = false; // Marcamos para sincronizar
        
        // Guardamos el cambio en localStorage
        localStorage.setItem('inventarioLibreta', JSON.stringify(productos));
        renderizarLista();
    }
}

renderizarLista();

// Sincronización cada 30 segundos
setInterval(async () => {
    if (navigator.onLine) {
        const inventario = JSON.parse(localStorage.getItem('inventarioLibreta')) || [];
        const pendientes = inventario.filter(p => p.sincronizado === false);

        if (pendientes.length > 0) {
            console.log(`Sincronizando ${pendientes.length} cambios...`);
            
            // Enviar todos los pendientes de una sola vez
            await fetch('/.netlify/functions/SincronizarTodo', {
                method: 'POST',
                body: JSON.stringify(pendientes)
            });

            // Marcar como sincronizados localmente
            pendientes.forEach(p => p.sincronizado = true);
            localStorage.setItem('inventarioLibreta', JSON.stringify(inventario));
        }
    }
}, 30000); // 30.000 milisegundos

