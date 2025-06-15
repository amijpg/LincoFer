// Constructor de Producto
function Producto(id, nombre, precio, imagen, categoria) {
    this.id = id;
    this.nombre = nombre;
    this.precio = precio;
    this.imagen = imagen;
    this.categoria = categoria;
  }

  let productos = [];  
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  let total = 0;
  
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
  
  function renderizarProductos(lista = productos) {
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
      li.textContent = `${cat.nombre === "todos" ? 'Todos los productos' : `${capitalizar(cat.nombre)}`} (${cat.cantidad})`;
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
  
function finalizarCompra() {
  if (carrito.length === 0) {
    Swal.fire("Tu carrito está vacío.");
    return;
  }

  Swal.fire({
    title: "¿Finalizar compra?",
    text: `Total: $${total}`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, finalizar",
    cancelButtonText: "Seguir comprando"
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire("¡Gracias por tu compra!", `Total: $${total}`, "success");
      vaciarCarrito();
    }
  });
}

  
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("vaciar-carrito")?.addEventListener("click", vaciarCarrito);
    document.getElementById("finalizar-compra")?.addEventListener("click", finalizarCompra);
      
    fetch('https://raw.githubusercontent.com/amijpg/LincoFer/main/data/productos.json')
    .then(res => res.json())
    .then(data => {
      productos = data.map(p => new Producto(p.id, p.nombre, p.precio, p.imagen, p.categoria));
      renderizarProductos();
      renderizarCategorias();
      cargarCarrito();
    })

    .catch(err => console.error("Error al cargar productos:", err));

  });
  