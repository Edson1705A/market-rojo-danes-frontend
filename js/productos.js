// CONTADOR DE RESULTADOS
function actualizarContador(cantidad) {
  var el = document.getElementById("contadorResultados");
  if (!el) return;
  el.textContent = cantidad === 1
    ? "1 producto encontrado"
    : cantidad + " productos encontrados";
}

// CONTAR GRUPOS
function contarGrupos(lista) {
  var gruposVistos = {};
  var count = 0;
  lista.forEach(function(p) {
    if (!p.grupoId) {
      count++;
    } else if (!gruposVistos[p.grupoId]) {
      gruposVistos[p.grupoId] = true;
      count++;
    }
  });
  return count;
}

// ORDENAR PRODUCTOS
function ordenarProductos() {
  productos = recargarProductos();
  var criterio = document.getElementById("ordenar").value;
  var lista    = productos.slice();

  if (criterio === "precio-asc") {
    lista.sort(function(a, b) { return a.precio - b.precio; });
  } else if (criterio === "precio-desc") {
    lista.sort(function(a, b) { return b.precio - a.precio; });
  } else if (criterio === "nombre") {
    lista.sort(function(a, b) { return a.nombre.localeCompare(b.nombre); });
  }

  mostrarProductos(lista);
  actualizarContador(contarGrupos(lista));
}

var _mostrarOriginalProductos = mostrarProductos;
mostrarProductos = function(lista) {
  _mostrarOriginalProductos(lista);
  actualizarContador(contarGrupos(lista));
};

// SESIÓN
function toggleMenu() {
  var menu = document.getElementById("menuDesplegable");
  if (menu) menu.classList.toggle("oculto");
}

function cerrarSesion() {
  localStorage.removeItem("usuarioLogueado");
  window.location.reload();
}

document.addEventListener("click", function(e) {
  var panel = document.getElementById("panelUsuario");
  var menu  = document.getElementById("menuDesplegable");
  if (panel && menu && !panel.contains(e.target)) {
    menu.classList.add("oculto");
  }
});

// GENERAR CATEGORÍAS DINÁMICAMENTE
function generarCategorias() {
  var contenedor = document.getElementById("listaCategorias");
  if (!contenedor) return;

  var todosDB = JSON.parse(localStorage.getItem("productosDB") || "[]")
    .filter(function(p) { return p.activo !== false; });

  // Obtener categorías únicas preservando orden de aparición
  var categoriasVistas = {};
  var categorias = [];
  todosDB.forEach(function(p) {
    if (p.categoria && !categoriasVistas[p.categoria]) {
      categoriasVistas[p.categoria] = true;
      categorias.push(p.categoria);
    }
  });

  // Nombres legibles
  var nombresLegibles = {
    lacteos:  "Lácteos",
    carnes:   "Carnes",
    frutas:   "Frutas",
    bebidas:  "Bebidas",
    limpieza: "Limpieza",
    verduras: "Verduras",
    galletas: "Galletas",
    otros:    "Otros"
  };

  contenedor.innerHTML = "";

  // Botón "Todos"
  var btnTodos = document.createElement("button");
  btnTodos.className = "cat-btn activo";
  btnTodos.dataset.categoria = "todos";
  btnTodos.textContent = "Todos";
  btnTodos.addEventListener("click", function() {
    filtrarCategoriaProductos("todos", this);
  });
  contenedor.appendChild(btnTodos);

  // Un botón por categoría existente
  categorias.forEach(function(cat) {
    var btn = document.createElement("button");
    btn.className = "cat-btn";
    btn.dataset.categoria = cat;
    btn.textContent = nombresLegibles[cat] || (cat.charAt(0).toUpperCase() + cat.slice(1));
    btn.addEventListener("click", function() {
      filtrarCategoriaProductos(cat, this);
    });
    contenedor.appendChild(btn);
  });
}

// FILTRAR DESDE EL SIDEBAR DE PRODUCTOS (independiente del index)
function filtrarCategoriaProductos(categoria, btn) {
  productos = recargarProductos();
  document.querySelectorAll("#listaCategorias .cat-btn").forEach(function(b) {
    b.classList.remove("activo");
  });
  if (btn) btn.classList.add("activo");

  if (categoria === "todos") {
    mostrarProductos(productos);
  } else {
    var filtrados = productos.filter(function(p) {
      return p.categoria === categoria;
    });
    mostrarProductos(filtrados);
  }
}

// INICIALIZAR
window.onload = function() {
  verificarSesion();
  cargarProductosDesdeAPI().then(function(lista) {
    productos = lista;
    generarCategorias();
    mostrarProductos(productos);
  });
};