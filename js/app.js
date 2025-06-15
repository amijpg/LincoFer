let productos = [];
let carrito = [];
let total = 0;

async function cargarProductos() {
  try {
    const resp = await fetch('data/productos.json');
    productos = await resp.json();
    renderizarProductos(productos);
    renderizarCategorias();
  } catch (error) {
    console.error('Error al cargar productos:', error);
  }
}

function renderizarProductos(lista) {
  const contenedor = document.getElementById("contenedor-productos");
  contenedor.innerHTML = "";

  lista.forEach(p => {
    const div = document.createElement("div");
    div.classList.add("producto");
    div.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre}">
      <h3>${p.nombre}</h3>
      <p>$${p.precio}</p>
      <button class="btn-comprar" data-id="${p.id}">Agregar al carrito</button>
    `;
    contenedor.appendChild(div);
  });

  document.querySelectorAll(".btn-comprar").forEach(boton => {
    boton.addEventListener("click", e => {
      const id = parseInt(e.target.dataset.id);
      agregarAlCarrito(id);
    });
  });
}

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function renderizarCategorias() {
  const listaCategorias = document.getElementById("lista-categorias");
  const categoriasUnicas = [...new Set(productos.map(p => p.categoria))];
  listaCategorias.innerHTML = '';

  const categoriasConContador = [
    { nombre: "todos", cantidad: productos.length },
    ...categoriasUnicas.map(cat => ({
      nombre: cat,
      cantidad: productos.filter(p => p.categoria === cat).length
    }))
  ];

  categoriasConContador.forEach(cat => {
    const li = document.createElement('li');
    li.className = 'categoria';
    li.dataset.categoria = cat.nombre;
    li.textContent = `${cat.nombre === "todos" ? '● Todos los productos' : `○ ${capitalizar(cat.nombre)}`} (${cat.cantidad})`;
    listaCategorias.appendChild(li);
  });

  document.querySelectorAll('.categoria').forEach(btn => {
    btn.addEventListener('click', e => {
      document.querySelectorAll('.categoria').forEach(c => c.classList.remove('active'));
      e.target.classList.add('active');
      const categoriaSeleccionada = e.target.dataset.categoria;
      const filtrados = categoriaSeleccionada === "todos"
        ? productos
        : productos.filter(p => p.categoria === categoriaSeleccionada);
      renderizarProductos(filtrados);
    });
  });
}

function actualizarCarrito() {
  const carritoContenido = document.getElementById("carrito-contenido");
  const totalTexto = document.getElementById("total");
  const contador = document.getElementById("contador");

  if (!carritoContenido || !totalTexto) return;

  carritoContenido.innerHTML = "";

  if (carrito.length === 0) {
    carritoContenido.innerHTML = "<p>Carrito vacío</p>";
  } else {
    carrito.forEach(producto => {
      const item = document.createElement("p");
      item.textContent = `${producto.nombre} - $${producto.precio}`;
      carritoContenido.appendChild(item);
    });
  }

  totalTexto.textContent = total;
  if (contador) contador.textContent = carrito.length;

  guardarCarrito();
}

function vaciarCarrito() {
  carrito = [];
  total = 0;
  actualizarCarrito();
}

function agregarAlCarrito(id) {
  const producto = productos.find(p => p.id === id);
  if (!producto) return;

  carrito.push(producto);
  total += producto.precio;
  actualizarCarrito();
}

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
  localStorage.setItem("total", total.toString());
}

function cargarCarrito() {
  const carritoGuardado = localStorage.getItem("carrito");
  const totalGuardado = localStorage.getItem("total");

  if (carritoGuardado) {
    carrito = JSON.parse(carritoGuardado);
    total = parseFloat(totalGuardado) || 0;
    actualizarCarrito();
  }
}

function finalizarCompra() {
  if (carrito.length === 0) {
    Swal.fire('Carrito vacío', 'Agrega productos antes de finalizar.', 'info');
    return;
  }

  Swal.fire({
    title: '¿Estás segura de finalizar la compra?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, finalizar',
    cancelButtonText: 'Seguir comprando'
  }).then(result => {
    if (result.isConfirmed) {
      Swal.fire('Compra exitosa', `Gracias por tu compra! Total: $${total}`, 'success');
      vaciarCarrito();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('vaciar-carrito').addEventListener('click', vaciarCarrito);
  document.getElementById('finalizar-compra').addEventListener('click', finalizarCompra);
  cargarCarrito();
  cargarProductos();
});
