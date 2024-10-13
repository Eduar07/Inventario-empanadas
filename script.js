// Inicializar datos de empanadas
let empanadas = {};
let ventasDia = 0;
let ventaReciente = 0;
let totalEmpanadasVendidas = 0;

// Obtener el día de la semana
const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const fechaActual = new Date();
const diaSemana = diasSemana[fechaActual.getDay()];

// Valores iniciales de inventario
const inventarioInicial = {
  carne: { precio: 3500, inventario: 50 },
  pollo: { precio: 3500, inventario: 50 },
  mortadela: { precio: 3500, inventario: 50 },
  ranchera: { precio: 3500, inventario: 50 },
  'pollo-queso': { precio: 3500, inventario: 50 },
  papas: { precio: 3500, inventario: 50 },
  mixtas: { precio: 3500, inventario: 50 },
  'arepas-carne': { precio: 3500, inventario: 50 },
  chicharron: { precio: 3500, inventario: 50 },
  patacones: { precio: 10000, inventario: 50 },
};

// Cargar datos desde LocalStorage
function cargarDatos() {
  const datosEmpanadas = localStorage.getItem('empanadas');
  if (datosEmpanadas) {
    empanadas = JSON.parse(datosEmpanadas);
  } else {
    empanadas = JSON.parse(JSON.stringify(inventarioInicial)); // Clonar objeto
    guardarEmpanadas();
  }

  const datosVentas = localStorage.getItem('ventasDia');
  if (datosVentas) {
    ventasDia = JSON.parse(datosVentas);
  } else {
    ventasDia = 0;
  }

  const datosVentaReciente = localStorage.getItem('ventaReciente');
  if (datosVentaReciente) {
    ventaReciente = JSON.parse(datosVentaReciente);
  } else {
    ventaReciente = 0;
  }

  const datosEmpanadasVendidas = localStorage.getItem('totalEmpanadasVendidas');
  if (datosEmpanadasVendidas) {
    totalEmpanadasVendidas = JSON.parse(datosEmpanadasVendidas);
  } else {
    totalEmpanadasVendidas = 0;
  }

  const datosVentasSemana = localStorage.getItem('ventasSemana');
  if (datosVentasSemana) {
    ventasSemana = JSON.parse(datosVentasSemana);
  } else {
    ventasSemana = {};
  }

  if (!ventasSemana[diaSemana]) {
    ventasSemana[diaSemana] = { total: 0, empanadas: 0 };
  }
}

// Guardar datos en LocalStorage
function guardarEmpanadas() {
  localStorage.setItem('empanadas', JSON.stringify(empanadas));
}

function guardarVentas() {
  localStorage.setItem('ventasDia', JSON.stringify(ventasDia));
  localStorage.setItem('ventaReciente', JSON.stringify(ventaReciente));
  localStorage.setItem('totalEmpanadasVendidas', JSON.stringify(totalEmpanadasVendidas));

  ventasSemana[diaSemana] = {
    total: ventasDia,
    empanadas: totalEmpanadasVendidas,
  };
  localStorage.setItem('ventasSemana', JSON.stringify(ventasSemana));
}

// Generar tabla de productos
function generarTabla() {
  const tableBody = document.getElementById('empanada-table');
  tableBody.innerHTML = '';

  for (const [nombre, datos] of Object.entries(empanadas)) {
    const fila = document.createElement('tr');

    fila.innerHTML = `
      <td>${nombre}</td>
      <td>${datos.precio} COP</td>
      <td id="inventario-${nombre}">${datos.inventario}</td>
      <td><input type="number" id="cantidad-${nombre}" min="0" value="0"></td>
      <td>
        <button class="editar-producto" data-producto="${nombre}">Editar</button>
        <button class="eliminar-producto" data-producto="${nombre}">Eliminar</button>
      </td>
    `;

    tableBody.appendChild(fila);
  }

  // Eventos para editar y eliminar
  document.querySelectorAll('.editar-producto').forEach(btn => {
    btn.addEventListener('click', editarProducto);
  });

  document.querySelectorAll('.eliminar-producto').forEach(btn => {
    btn.addEventListener('click', eliminarProducto);
  });
}

// Registrar venta
document.getElementById('registrar-venta').addEventListener('click', function() {
  ventaReciente = 0;
  let empanadasVendidasReciente = 0;

  for (const [nombre, datos] of Object.entries(empanadas)) {
    const cantidadVendida = parseInt(document.getElementById(`cantidad-${nombre}`).value);
    if (!isNaN(cantidadVendida) && cantidadVendida > 0) {
      empanadas[nombre].inventario -= cantidadVendida;
      const montoVenta = cantidadVendida * datos.precio;
      ventaReciente += montoVenta;
      ventasDia += montoVenta;
      empanadasVendidasReciente += cantidadVendida;
      totalEmpanadasVendidas += cantidadVendida;
      document.getElementById(`cantidad-${nombre}`).value = 0;
    }
  }

  document.getElementById('venta-reciente').textContent = ventaReciente;
  document.getElementById('total-venta-dia').textContent = ventasDia;
  document.getElementById('total-empanadas-vendidas').textContent = totalEmpanadasVendidas;
  guardarEmpanadas();
  guardarVentas();
  actualizarInventarioRestante();
  generarTabla();
  mostrarVentasSemana();
});

// Reiniciar venta
document.getElementById('reiniciar-venta').addEventListener('click', function() {
  generarTabla();
  ventaReciente = 0;
  document.getElementById('venta-reciente').textContent = ventaReciente;
});

// Reiniciar total
document.getElementById('reiniciar-total').addEventListener('click', function() {
  // Mostrar total de ventas y empanadas vendidas
  alert(`Total vendido hoy: ${ventasDia} COP\nTotal de empanadas vendidas hoy: ${totalEmpanadasVendidas}`);

  // Agregar información al día de venta ya se hace en guardarVentas()

  // Reiniciar variables
  ventasDia = 0;
  ventaReciente = 0;
  totalEmpanadasVendidas = 0;
  empanadas = JSON.parse(JSON.stringify(inventarioInicial)); // Reiniciar inventario

  guardarEmpanadas();
  guardarVentas();

  document.getElementById('venta-reciente').textContent = ventaReciente;
  document.getElementById('total-venta-dia').textContent = ventasDia;
  document.getElementById('total-empanadas-vendidas').textContent = totalEmpanadasVendidas;

  actualizarInventarioRestante();
  generarTabla();
  mostrarVentasSemana();
});

// Actualizar inventario restante
function actualizarInventarioRestante() {
  const inventarioList = document.getElementById('inventario-restante');
  inventarioList.innerHTML = '';

  for (const [nombre, datos] of Object.entries(empanadas)) {
    const listItem = document.createElement('li');
    listItem.textContent = `${nombre}: ${datos.inventario} unidades restantes`;
    inventarioList.appendChild(listItem);
  }
}

// Mostrar ventas de la semana
function mostrarVentasSemana() {
  const ventasList = document.getElementById('ventas-semana');
  ventasList.innerHTML = '';

  for (const [dia, datos] of Object.entries(ventasSemana)) {
    const listItem = document.createElement('li');
    listItem.textContent = `${dia}: ${datos.total} COP - ${datos.empanadas} empanadas vendidas`;
    ventasList.appendChild(listItem);
  }
}

// Agregar producto
document.getElementById('agregar-producto').addEventListener('click', function() {
  abrirModal();
});

// Abrir modal
function abrirModal(producto = null) {
  const modal = document.getElementById('producto-modal');
  const titulo = document.getElementById('modal-title');
  const formulario = document.getElementById('producto-form');

  if (producto) {
    titulo.textContent = 'Editar Producto';
    document.getElementById('producto-nombre').value = producto;
    document.getElementById('producto-nombre').disabled = true;
    document.getElementById('producto-precio').value = empanadas[producto].precio;
    document.getElementById('producto-inventario').value = empanadas[producto].inventario;
  } else {
    titulo.textContent = 'Agregar Producto';
    formulario.reset();
    document.getElementById('producto-nombre').disabled = false;
  }

  modal.style.display = 'block';
}

// Cerrar modal
document.querySelector('.close').addEventListener('click', function() {
  document.getElementById('producto-modal').style.display = 'none';
});

// Guardar producto
document.getElementById('producto-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const nombre = document.getElementById('producto-nombre').value;
  const precio = parseFloat(document.getElementById('producto-precio').value);
  const inventario = parseInt(document.getElementById('producto-inventario').value);

  if (nombre && !isNaN(precio) && !isNaN(inventario)) {
    empanadas[nombre] = { precio: precio, inventario: inventario };
    guardarEmpanadas();
    generarTabla();
    actualizarInventarioRestante();
    document.getElementById('producto-modal').style.display = 'none';
  }
});

// Editar producto
function editarProducto(e) {
  const producto = e.target.getAttribute('data-producto');
  abrirModal(producto);
}

// Eliminar producto
function eliminarProducto(e) {
  const producto = e.target.getAttribute('data-producto');
  if (confirm(`¿Estás seguro de eliminar el producto ${producto}?`)) {
    delete empanadas[producto];
    guardarEmpanadas();
    generarTabla();
    actualizarInventarioRestante();
  }
}

// Inicializar aplicación
cargarDatos();
generarTabla();
actualizarInventarioRestante();
document.getElementById('venta-reciente').textContent = ventaReciente;
document.getElementById('total-venta-dia').textContent = ventasDia;
document.getElementById('total-empanadas-vendidas').textContent = totalEmpanadasVendidas;
mostrarVentasSemana();

// Cerrar modal al hacer clic fuera de él
window.onclick = function(event) {
  const modal = document.getElementById('producto-modal');
  if (event.target == modal) {
    modal.style.display = 'none';
  }
}
