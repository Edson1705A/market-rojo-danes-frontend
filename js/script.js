// SISTEMA DE MODALES PROPIOS
function mostrarAlerta(mensaje, tipo, callback) {
  tipo = tipo || "info"; // "info", "exito", "error"
  var iconos = { info:"ℹ️", exito:"✅", error:"⚠️" };
  var colores = { info:"#2471a3", exito:"#1e8449", error:"#c0392b" };

  var fondo = document.createElement("div");
  fondo.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;";

  var caja = document.createElement("div");
  caja.style.cssText = "background:white;border-radius:16px;padding:32px 28px;max-width:360px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.2);font-family:'Segoe UI',sans-serif;animation:aparecer 0.2s ease;";
  caja.innerHTML =
    '<div style="font-size:2.5rem;margin-bottom:12px;">' + iconos[tipo] + '</div>' +
    '<p style="font-size:0.95rem;color:#333;line-height:1.6;margin-bottom:24px;">' + mensaje + '</p>' +
    '<button style="background:' + colores[tipo] + ';color:white;border:none;padding:11px 32px;border-radius:30px;font-size:0.95rem;font-weight:700;cursor:pointer;width:100%;">Aceptar</button>';

  caja.querySelector("button").onclick = function() {
    fondo.remove();
    if (callback) callback();
  };

  fondo.onclick = function(e) { if (e.target === fondo) { fondo.remove(); if (callback) callback(); } };
  fondo.appendChild(caja);
  document.body.appendChild(fondo);
}

function mostrarConfirm(mensaje, onSi, onNo) {
  var fondo = document.createElement("div");
  fondo.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;";

  var caja = document.createElement("div");
  caja.style.cssText = "background:white;border-radius:16px;padding:32px 28px;max-width:360px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.2);font-family:'Segoe UI',sans-serif;";
  caja.innerHTML =
    '<div style="font-size:2.5rem;margin-bottom:12px;">🤔</div>' +
    '<p style="font-size:0.95rem;color:#333;line-height:1.6;margin-bottom:24px;">' + mensaje + '</p>' +
    '<div style="display:flex;gap:10px;">' +
      '<button id="btnConfirmSi" style="flex:1;background:var(--rojo,#c62b0c);color:white;border:none;padding:11px;border-radius:30px;font-size:0.92rem;font-weight:700;cursor:pointer;">Sí, confirmar</button>' +
      '<button id="btnConfirmNo" style="flex:1;background:white;color:#666;border:2px solid #e0e0e0;padding:11px;border-radius:30px;font-size:0.92rem;font-weight:600;cursor:pointer;">Cancelar</button>' +
    '</div>';

  caja.querySelector("#btnConfirmSi").onclick = function() { fondo.remove(); if (onSi) onSi(); };
  caja.querySelector("#btnConfirmNo").onclick = function() { fondo.remove(); if (onNo) onNo(); };
  fondo.onclick = function(e) { if (e.target === fondo) { fondo.remove(); if (onNo) onNo(); } };
  fondo.appendChild(caja);
  document.body.appendChild(fondo);
}

var imgBase = window.location.pathname.includes('/paginas/') ? '../img/' : 'img/';

// SEMILLA DE PRODUCTOS
var PRODUCTOS_DEFAULT = [
  { id:1, nombre:"Leche Entera 1L",      categoria:"lacteos",  precio:2.50, precioAntes:3.20, oferta:true,  tipoOferta:"descuento", fechaFin:"2026-07-30", stock:48, imagen:"leche.jpg",       nuevo:false, activo:true },
  { id:2, nombre:"Queso Gouda 250g",     categoria:"lacteos",  precio:4.80, precioAntes:null, oferta:false, tipoOferta:null,        fechaFin:null,         stock:12, imagen:"queso_gouda.jpg",  nuevo:false, activo:true },
  { id:3, nombre:"Pechuga de Pollo 1kg", categoria:"carnes",   precio:8.90, precioAntes:null, oferta:false, tipoOferta:null,        fechaFin:null,         stock:0,  imagen:"https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400", nuevo:false, activo:true },
  { id:4, nombre:"Manzanas Rojas x6",   categoria:"frutas",   precio:3.20, precioAntes:4.50, oferta:true,  tipoOferta:"pocas",     fechaFin:"2026-06-25", stock:4,  imagen:"https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400",  nuevo:false, activo:true },
  { id:5, nombre:"Jugo de Naranja 1L",  categoria:"bebidas",  precio:3.50, precioAntes:null, oferta:false, tipoOferta:null,        fechaFin:null,         stock:20, imagen:"https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400",  nuevo:false, activo:true },
  { id:6, nombre:"Detergente Liquido 2L",categoria:"limpieza", precio:6.00, precioAntes:7.50, oferta:true,  tipoOferta:"descuento", fechaFin:null,         stock:15, imagen:"https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400",  nuevo:false, activo:true }
];

async function cargarProductosDesdeAPI() {
  var resultado = await apiGet("/productos");
  if (!resultado || !resultado.data.ok) return [];
  return resultado.data.productos.map(function(p) {
    return {
      id:          p.id,
      nombre:      p.nombre,
      categoria:   p.categoria,
      precio:      parseFloat(p.precio),
      precioAntes: p.precio_antes ? parseFloat(p.precio_antes) : null,
      oferta:      p.oferta === 1,
      tipoOferta:  p.tipo_oferta,
      fechaFin:    p.fecha_fin,
      stock:       p.stock,
      imagen:      p.imagen,
      nuevo:       p.nuevo === 1,
      activo:      p.activo === 1,
      grupoId:     p.grupo_id ? String(p.grupo_id) : null
    };
  });
}

function recargarProductos() {
  return productos;
}

function guardarProductosDB(lista) {
  console.log("guardarProductosDB: operación manejada por el backend");
}

function inicializarProductos() {
  // Ya no se necesita semilla local
}

function resolverImagen(imagen) {
  if (!imagen) return imgBase + "placeholder.jpg";
  if (imagen.startsWith("http")) return imagen;
  if (imagen.startsWith("data:")) return imagen; // base64
  if (imagen.startsWith("/uploads/")) return "http://localhost:3000" + imagen; // archivo subido al servidor
  return imgBase + imagen; // archivo local en carpeta img/
}

function generarIdProducto() {
  var todos = JSON.parse(localStorage.getItem("productosDB") || "[]");
  if (todos.length === 0) return 1;
  return Math.max.apply(null, todos.map(function(p) { return p.id; })) + 1;
}

var productos = [];

// Carrito persistente
var carrito = JSON.parse(localStorage.getItem("carritoGuardado") || "[]");

// Guardar carrito
function guardarCarrito() {
  localStorage.setItem("carritoGuardado", JSON.stringify(carrito));
}

// Eliminar items sin stock
function limpiarAgotados() {
  var todosDB = JSON.parse(localStorage.getItem("productosDB") || "[]");
  var antes = carrito.length;
  carrito = carrito.filter(function(item) {
    var prod = todosDB.find(function(p) { return p.id === item.id; });
    return prod && prod.activo !== false && prod.stock > 0;
  });
  if (carrito.length !== antes) {
    guardarCarrito();
  }
}

function mostrarProductos(lista) {
  var grilla = document.getElementById("grilla-productos");
  if (!grilla) return;
  grilla.innerHTML = "";

  var usuarioData = localStorage.getItem("usuarioLogueado");
  var esAdmin = usuarioData ? JSON.parse(usuarioData).esAdmin === true : false;

  if (esAdmin) {
    var cardAgregar = document.createElement("div");
    cardAgregar.className = "tarjeta tarjeta-agregar";
    cardAgregar.onclick = function() { abrirModalProducto(null); };
    cardAgregar.innerHTML =
      '<div class="agregar-icono">+</div>' +
      '<div class="agregar-texto">Agregar producto</div>';
    grilla.appendChild(cardAgregar);
  }

  if (lista.length === 0) {
    var msg = document.createElement("p");
    msg.style.cssText = "color:#999;padding:20px;";
    msg.textContent = "No se encontraron productos.";
    grilla.appendChild(msg);
    return;
  }

  // AGRUPAR POR grupoId
  var grupos = [];
  var gruposMap = {};
  lista.forEach(function(p) {
    if (!p.grupoId) {
      grupos.push({ ids: [p.id], variantes: [p] });
    } else {
      if (gruposMap[p.grupoId] === undefined) {
        gruposMap[p.grupoId] = grupos.length;
        grupos.push({ grupoId: p.grupoId, ids: [p.id], variantes: [p] });
      } else {
        grupos[gruposMap[p.grupoId]].ids.push(p.id);
        grupos[gruposMap[p.grupoId]].variantes.push(p);
      }
    }
  });

  grupos.forEach(function(grupo) {
    var esGrupo = grupo.variantes.length > 1;
    var p = grupo.variantes[0];
    var agotadoTodo  = grupo.variantes.every(function(v) { return v.stock === 0; });
    var pocasUnidades = !agotadoTodo && grupo.variantes.some(function(v) { return v.stock > 0 && v.stock <= 10; });
    var algunoNuevo  = grupo.variantes.some(function(v) { return v.nuevo; });
    var precioMin    = Math.min.apply(null, grupo.variantes.map(function(v) { return v.precio; }));

    var tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta" + (agotadoTodo && !esAdmin ? " tarjeta-agotada" : "");
    var idsArr = grupo.ids;
    tarjeta.onclick = function() { abrirDetalle(idsArr); };

    // ETIQUETAS
    var etiqueta = "";
    if (algunoNuevo) {
      etiqueta += '<div class="tarjeta-etiqueta etiqueta-nuevo">Nuevo</div>';
    } else if (agotadoTodo) {
      etiqueta += '<div class="tarjeta-etiqueta etiqueta-agotado">Sin stock</div>';
    } else if (pocasUnidades) {
      etiqueta += '<div class="tarjeta-etiqueta etiqueta-pocas">Pocas unidades</div>';
    }
    if (esGrupo) {
      etiqueta += '<div class="tarjeta-etiqueta etiqueta-varios">Varios</div>';
    }

    var imgSrc = resolverImagen(p.imagen);
    var precioTexto = esGrupo
      ? "Desde S/ " + precioMin.toFixed(2)
      : "S/ " + p.precio.toFixed(2);
    var precioAntesHTML = (!esGrupo && p.precioAntes)
      ? '<span class="tarjeta-precio-antes">S/ ' + p.precioAntes.toFixed(2) + '</span>'
      : "";

    var accionesHTML = "";
    if (esAdmin) {
      accionesHTML =
        '<button class="btn-editar-producto" onclick="abrirDetalle([' + idsArr.join(",") + ']);event.stopPropagation();">' +
          '✏️ ' + (esGrupo ? "Gestionar variantes" : "Editar producto") +
        '</button>';
    } else if (agotadoTodo) {
      accionesHTML = '<button class="btn-agregar" disabled>Sin stock</button>';
    } else {
      accionesHTML =
        '<button class="btn-agregar" onclick="abrirDetalle([' + idsArr.join(",") + ']);event.stopPropagation();">' +
          (esGrupo ? "Ver variantes" : "Ver detalle") +
        '</button>';
    }

    tarjeta.innerHTML =
      etiqueta +
      '<img class="tarjeta-imagen" src="' + imgSrc + '" alt="' + p.nombre + '">' +
      '<div class="tarjeta-info">' +
        '<div class="tarjeta-categoria">' + p.categoria + '</div>' +
        '<div class="tarjeta-nombre">' + (esGrupo ? obtenerNombreGrupo(grupo.variantes) : p.nombre) + '</div>' +
        '<div class="tarjeta-footer">' +
          '<span class="tarjeta-precio">' + precioTexto + '</span>' +
          precioAntesHTML +
        '</div>' +
        accionesHTML +
      '</div>';

    grilla.appendChild(tarjeta);
    // BADGES DE OFERTA EN GRILLA
    if (!esAdmin && !esGrupo && p.oferta) {
      if (p.precioAntes) {
        var desc = Math.round(((p.precioAntes - p.precio) / p.precioAntes) * 100);
        if (desc > 0) {
          var badgeDesc = document.createElement("div");
          badgeDesc.className = "badge-descuento";
          badgeDesc.textContent = "-" + desc + "%";
          tarjeta.appendChild(badgeDesc);
        }
      }
      if (p.fechaFin) {
        var hoyB   = new Date();
        var limB   = new Date(p.fechaFin);
        var diffB  = Math.ceil((limB - hoyB) / (1000 * 60 * 60 * 24));
        if (diffB <= 7) {
          var badgeTime = document.createElement("div");
          badgeTime.className = "badge-tiempo";
          badgeTime.textContent = diffB <= 0 ? "⏳ Último día" : "⏳ " + diffB + " días";
          tarjeta.appendChild(badgeTime);
        }
      }
    }
  });
}

function cambiarCantidad(id, cambio) {
  var span = document.getElementById("cantidad-" + id);
  if (!span) return;
  var actual = parseInt(span.textContent);
  var producto = productos.find(function(p) { return p.id === id; });
  var maximo = producto ? producto.stock : 1;
  var nuevo = actual + cambio;
  if (nuevo < 1) nuevo = 1;
  if (nuevo > maximo) nuevo = maximo;
  span.textContent = nuevo;
}

function agregarAlCarrito(id) {
  var usuarioLogueado = localStorage.getItem("usuarioLogueado");
  if (!usuarioLogueado) {
    mostrarAvisoLogin();
    return;
  }

  var producto = productos.find(function(p) { return p.id === id; });
  var yaEsta = carrito.find(function(p) { return p.id === id; });
  var spanCantidad = document.getElementById("cantidad-" + id);
  var cantidad = spanCantidad ? parseInt(spanCantidad.textContent) : 1;

  if (yaEsta) {
    yaEsta.cantidad += cantidad;
  } else {
    var item = Object.assign({}, producto);
    item.cantidad = cantidad;
    carrito.push(item);
  }

  if (spanCantidad) spanCantidad.textContent = "1";

  actualizarCarrito();
  guardarCarrito(); // ── CAMBIO 4: persistir tras cada cambio
}

function mostrarAvisoLogin() {
  const aviso = document.createElement("div");
  aviso.id = "avisoLogin";
  aviso.style.cssText = `
    position: fixed;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border-radius: 16px;
    padding: 36px 40px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.25);
    z-index: 9999;
    text-align: center;
    max-width: 360px;
    width: 90%;
    font-family: 'Segoe UI', sans-serif;
  `;
  aviso.innerHTML =
    '<div style="font-size:2.5rem; margin-bottom:12px;">🔒</div>' +
    '<h3 style="font-size:1.2rem; color:#222; margin-bottom:8px;">Inicia sesión para continuar</h3>' +
    '<p style="color:#888; font-size:0.9rem; margin-bottom:24px; line-height:1.5;">' +
      'Para agregar productos al carrito necesitas tener una cuenta.' +
    '</p>' +
    '<button onclick="irAlLogin()" style="' +
      'background:#c0392b; color:white; border:2px solid #c0392b;' +
      'padding:12px 28px; border-radius:30px; font-size:1rem;' +
      'font-weight:700; cursor:pointer; width:100%; margin-bottom:12px;' +
    '">Iniciar sesión</button>' +
    '<button onclick="cerrarAviso()" style="' +
      'background:white; color:#c0392b; border:2px solid #c0392b;' +
      'padding:12px 28px; border-radius:30px; font-size:0.95rem;' +
      'font-weight:600; cursor:pointer; width:100%;' +
    '">Cancelar</button>';

  const fondo = document.createElement("div");
  fondo.id = "fondoAviso";
  fondo.style.cssText = `
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 9998;
  `;
  fondo.onclick = cerrarAviso;
  document.body.appendChild(fondo);
  document.body.appendChild(aviso);
}

function irAlLogin() {
  var ruta = window.location.pathname;
  if (ruta.includes("/paginas/")) {
    window.location.href = "login.html";
  } else {
    window.location.href = "paginas/login.html";
  }
}

function cerrarAviso() {
  const aviso = document.getElementById("avisoLogin");
  const fondo = document.getElementById("fondoAviso");
  if (aviso) aviso.remove();
  if (fondo) fondo.remove();
}

function actualizarCarrito() {
  var total = 0;
  carrito.forEach(function(item) { total += item.cantidad; });
  const contador = document.getElementById("contadorCarrito");
  if (!contador) return;
  if (total > 0) {
    contador.textContent = total;
    contador.classList.add("visible");
  } else {
    contador.classList.remove("visible");
  }
}

function filtrarCategoria(categoria) {
  productos = recargarProductos();
  document.querySelectorAll(".cat-btn").forEach(function(btn) {
    btn.classList.remove("activo");
  });
  event.target.classList.add("activo");
  if (categoria === "todos") {
    mostrarProductos(productos);
  } else {
    var filtrados = productos.filter(function(p) {
      return p.categoria === categoria;
    });
    mostrarProductos(filtrados);
  }
}

function buscar() {
  productos = recargarProductos();
  var texto = document.getElementById("inputBusqueda").value.toLowerCase();
  var resultados = productos.filter(function(p) {
    return p.nombre.toLowerCase().indexOf(texto) !== -1;
  });
  mostrarProductos(resultados);
}

var elBtnBuscar = document.getElementById("btnBuscar");
var elInput = document.getElementById("inputBusqueda");
if (elBtnBuscar) { elBtnBuscar.addEventListener("click", buscar); }
if (elInput) {
  elInput.addEventListener("keyup", function(e) {
    if (e.key === "Enter") buscar();
  });
}

var catBtns = document.querySelectorAll(".cat-btn");
if (catBtns.length > 0) {
  catBtns.forEach(function(btn) {
    btn.addEventListener("click", function() {
      filtrarCategoria(this.dataset.categoria);
    });
  });
}

var elBtnExplorar = document.getElementById("btnExplorar");
if (elBtnExplorar) {
  elBtnExplorar.addEventListener("click", function() {
    var secProductos = document.getElementById("productos");
    if (secProductos) { secProductos.scrollIntoView({ behavior: "smooth" }); }
  });
}

generarCategoriasIndex();

// GENERAR CATEGORÍAS DEL INDEX DINÁMICAMENTE
function generarCategoriasIndex() {
  var contenedor = document.getElementById("listaCategorias");
  if (!contenedor) return;

  var todosDB = JSON.parse(localStorage.getItem("productosDB") || "[]")
    .filter(function(p) { return p.activo !== false; });

  var categoriasVistas = {};
  var categorias = [];
  todosDB.forEach(function(p) {
    if (p.categoria && !categoriasVistas[p.categoria]) {
      categoriasVistas[p.categoria] = true;
      categorias.push(p.categoria);
    }
  });

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

  // Mostrar máximo 5 categorías en el index, el resto lleva a productos
  var MAX_INDEX = 5;
  contenedor.innerHTML = "";

  var btnTodos = document.createElement("button");
  btnTodos.className = "cat-btn activo";
  btnTodos.dataset.categoria = "todos";
  btnTodos.textContent = "Todos";
  btnTodos.addEventListener("click", function() {
    filtrarCategoria("todos");
    document.querySelectorAll(".cat-btn").forEach(function(b) { b.classList.remove("activo"); });
    btnTodos.classList.add("activo");
  });
  contenedor.appendChild(btnTodos);

  categorias.slice(0, MAX_INDEX).forEach(function(cat) {
    var btn = document.createElement("button");
    btn.className = "cat-btn";
    btn.dataset.categoria = cat;
    btn.textContent = nombresLegibles[cat] || (cat.charAt(0).toUpperCase() + cat.slice(1));
    btn.addEventListener("click", function() {
      filtrarCategoria(cat);
      document.querySelectorAll(".cat-btn").forEach(function(b) { b.classList.remove("activo"); });
      btn.classList.add("activo");
    });
    contenedor.appendChild(btn);
  });

  // Botón "Ver más" si hay más de MAX_INDEX categorías
  var btnVerMas = document.createElement("button");
  btnVerMas.className = "cat-btn cat-ver-mas";
  btnVerMas.textContent = "Ver más →";
  btnVerMas.onclick = function() { window.location.href = "paginas/productos.html"; };
  contenedor.appendChild(btnVerMas);
}

// SISTEMA DE SESIÓN
function verificarSesion() {
  limpiarAgotados();
  actualizarCarrito();

  var datos = localStorage.getItem("usuarioLogueado");
  if (datos) {
    var usuario = JSON.parse(datos);
    document.getElementById("botonesAuth").classList.add("oculto");
    document.getElementById("panelUsuario").classList.remove("oculto");
    document.getElementById("nombreNav").textContent = usuario.nombre.split(" ")[0];
    document.getElementById("fotoNav").textContent = usuario.nombre.charAt(0).toUpperCase();
    document.getElementById("btnCarrito").style.display = usuario.esAdmin ? "none" : "flex";

    // ADMIN
    if (usuario.esAdmin) {
      var menu = document.getElementById("menuDesplegable");
      if (menu && !document.getElementById("linkPanelAdmin")) {
        var ruta = window.location.pathname;
        var href = ruta.includes("/paginas/") ? "admin.html" : "paginas/admin.html";
        var sep = document.createElement("div");
        sep.className = "menu-separador";
        var linkAdmin = document.createElement("a");
        linkAdmin.id = "linkPanelAdmin";
        linkAdmin.href = href;
        linkAdmin.innerHTML = "⚙️ Panel Admin";
        linkAdmin.style.color = "var(--rojo)";
        linkAdmin.style.fontWeight = "700";
        menu.insertBefore(sep, menu.firstChild);
        menu.insertBefore(linkAdmin, menu.firstChild);
      }
    }
  } else {
    document.getElementById("btnCarrito").style.display = "none";
  }

  // CARGAR PRODUCTOS DESDE API
  cargarProductosDesdeAPI().then(function(lista) {
    productos = lista;
    generarCategoriasIndex();
    if (productos.length > 0) {
      mostrarProductos(productos);
    } else {
      console.log("Sin productos desde API");
      mostrarProductos([]);
    }
  });
}

function toggleMenu() {
  document.getElementById("menuDesplegable").classList.toggle("oculto");
}

document.addEventListener("click", function(e) {
  const panel = document.getElementById("panelUsuario");
  const menu = document.getElementById("menuDesplegable");
  if (panel && menu && !panel.contains(e.target)) {
    menu.classList.add("oculto");
  }
});

function cerrarSesion() {
  localStorage.removeItem("usuarioLogueado");
  window.location.reload();
}

verificarSesion();

// PANEL DEL CARRITO 

var modoPanel = "lista"; // "lista" o "detalle"

function crearPanelCarrito() {
  // FONDO OSCURO
  var fondo = document.createElement("div");
  fondo.id = "fondoCarrito";
  fondo.onclick = cerrarPanelCarrito;
  document.body.appendChild(fondo);

  // PANEL LATERAL
  var panel = document.createElement("div");
  panel.id = "panelCarrito";
  panel.innerHTML =
    '<div class="panel-header">' +
      '<span class="panel-titulo">🛒 Mi carrito</span>' +
      '<div class="panel-modos">' +
        '<button id="btnModoLista" class="modo-btn modo-activo" onclick="cambiarModo(\'lista\')">☰ Lista</button>' +
        '<button id="btnModoDetalle" class="modo-btn" onclick="cambiarModo(\'detalle\')">⊞ Detalle</button>' +
      '</div>' +
      '<button class="panel-cerrar" onclick="cerrarPanelCarrito()">✕</button>' +
    '</div>' +
    '<div id="panelContenido" class="panel-contenido"></div>' +
    '<div class="panel-footer">' +
      '<div class="panel-total-row">' +
        '<span class="panel-total-label">Total estimado</span>' +
        '<span id="panelTotalMonto" class="panel-total-monto">S/ 0.00</span>' +
      '</div>' +
      '<p class="panel-aviso">* Precio referencial. El total real será confirmado por nuestro personal al procesar tu pedido.</p>' +
      '<button class="btn-whatsapp" onclick="enviarPedido()">📲 Enviar pedido por WhatsApp</button>' +
      '<button class="btn-vaciar" onclick="vaciarCarrito()">Vaciar carrito</button>' +
    '</div>';
  document.body.appendChild(panel);

  // CONECTAR BOTÓN FLOTANTE
  var btnCarrito = document.getElementById("btnCarrito");
  if (btnCarrito) {
    btnCarrito.addEventListener("click", abrirPanelCarrito);
  }
}

function abrirPanelCarrito() {
  document.getElementById("panelCarrito").classList.add("abierto");
  document.getElementById("fondoCarrito").classList.add("visible");
  document.body.style.overflow = "hidden";
  renderizarPanel();
}

function cerrarPanelCarrito() {
  document.getElementById("panelCarrito").classList.remove("abierto");
  document.getElementById("fondoCarrito").classList.remove("visible");
  document.body.style.overflow = "";
}

function cambiarModo(modo) {
  modoPanel = modo;
  document.getElementById("btnModoLista").classList.toggle("modo-activo", modo === "lista");
  document.getElementById("btnModoDetalle").classList.toggle("modo-activo", modo === "detalle");
  renderizarPanel();
}

function renderizarPanel() {
  var contenido  = document.getElementById("panelContenido");
  var totalMonto = document.getElementById("panelTotalMonto");
  if (!contenido) return;

  if (carrito.length === 0) {
    contenido.innerHTML =
      '<div class="panel-vacio">' +
        '<div style="font-size:3rem;margin-bottom:14px;">🛒</div>' +
        '<p>Tu carrito está vacío</p>' +
      '</div>';
    if (totalMonto) totalMonto.textContent = "S/ 0.00";
    return;
  }

  var todosDB = JSON.parse(localStorage.getItem("productosDB") || "[]");
  var html  = "";
  var total = 0;

  carrito.forEach(function(item) {
    var prodActual = todosDB.find(function(p) { return p.id === item.id; });
    var imgSrc = prodActual ? resolverImagen(prodActual.imagen) : resolverImagen(item.imagen);
    var subtotal = item.precio * item.cantidad;
    total += subtotal;

    var controles =
      '<div class="panel-item-fila">' +
        '<div class="panel-item-controles">' +
          '<button class="btn-panel-cantidad" onclick="cambiarCantidadPanel(' + item.id + ',-1)">−</button>' +
          '<span class="panel-item-cant">x' + item.cantidad + '</span>' +
          '<button class="btn-panel-cantidad" onclick="cambiarCantidadPanel(' + item.id + ',1)">+</button>' +
        '</div>' +
        '<div class="panel-item-derecha">' +
          '<span class="panel-item-precio">S/ ' + subtotal.toFixed(2) + '</span>' +
          '<button class="btn-panel-eliminar" onclick="eliminarDelCarrito(' + item.id + ')" title="Eliminar">🗑</button>' +
        '</div>' +
      '</div>';

    if (modoPanel === "detalle") {
      html +=
        '<div class="panel-item">' +
          '<img class="panel-item-img" src="' + imgSrc + '" alt="' + item.nombre + '">' +
          '<div class="panel-item-info">' +
            '<div class="panel-item-nombre">' + item.nombre + '</div>' +
            controles +
          '</div>' +
        '</div>';
    } else {
      html +=
        '<div class="panel-item panel-item-lista">' +
          '<div class="panel-item-info">' +
            '<div class="panel-item-nombre">' + item.nombre + '</div>' +
            controles +
          '</div>' +
        '</div>';
    }
  });

  contenido.innerHTML = html;
  if (totalMonto) totalMonto.textContent = "S/ " + total.toFixed(2);
}

function cambiarCantidadPanel(id, cambio) {
  var item = carrito.find(function(p) { return p.id === id; });
  if (!item) return;
  var todosDB  = JSON.parse(localStorage.getItem("productosDB") || "[]");
  var prodReal = todosDB.find(function(p) { return p.id === id; });
  var maximo   = prodReal ? prodReal.stock : 99;
  item.cantidad += cambio;
  if (item.cantidad < 1) item.cantidad = 1;
  if (item.cantidad > maximo) item.cantidad = maximo;
  guardarCarrito();
  actualizarCarrito();
  renderizarPanel();
}

function eliminarDelCarrito(id) {
  carrito = carrito.filter(function(p) { return p.id !== id; });
  guardarCarrito();
  actualizarCarrito();
  renderizarPanel();
}

function vaciarCarrito() {
  if (carrito.length === 0) return;
  mostrarConfirm(
    "¿Seguro que quieres vaciar el carrito?",
    function() {
      carrito = [];
      guardarCarrito();
      actualizarCarrito();
      renderizarPanel();
    }
  );
}

function enviarPedido() {
  if (carrito.length === 0) return;
  var usuario = localStorage.getItem("usuarioLogueado");
  if (!usuario) { irAlLogin(); return; }
  cerrarPanelCarrito();
  setTimeout(abrirCheckout, 300); // pequeño delay para que el panel termine de cerrarse
}

// MODAL DETALLE DE PRODUCTO — estado
var _detalleVariantes = [];
var _detalleIndice    = 0;

function obtenerNombreGrupo(variantes) {
  if (variantes.length === 1) return variantes[0].nombre;
  var nombres = variantes.map(function(v) { return v.nombre; });
  var base = nombres[0];
  var comun = "";
  for (var i = 0; i < base.length; i++) {
    var c = base[i];
    if (nombres.every(function(n) { return n.charAt(i) === c; })) comun += c;
    else break;
  }
  comun = comun.trim().replace(/[-\s,_]+$/, "").trim();
  return comun.length >= 3 ? comun : variantes[0].nombre;
}

function crearModalDetalle() {
  var fondo = document.createElement("div");
  fondo.id = "fondoDetalle";
  fondo.onclick = cerrarDetalle;
  fondo.style.cssText = "display:none;position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:3000;";
  document.body.appendChild(fondo);

  var modal = document.createElement("div");
  modal.id = "modalDetalle";
  modal.style.cssText = "display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:92%;max-width:540px;max-height:90vh;background:white;border-radius:16px;z-index:3001;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.25);overflow:hidden;";
  modal.innerHTML =
    '<div style="background:var(--rojo);color:white;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">' +
      '<span id="detalleGrupoNombre" style="font-size:1rem;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"></span>' +
      '<button onclick="cerrarDetalle()" style="background:transparent;border:none;color:white;font-size:1.3rem;cursor:pointer;padding:2px 8px;line-height:1;flex-shrink:0;">✕</button>' +
    '</div>' +
    '<div style="position:relative;background:#f8f8f8;flex-shrink:0;">' +
      '<img id="detalleImg" style="width:100%;height:240px;object-fit:contain;display:block;" alt="producto">' +
      '<button id="detalleFlechaIzq" onclick="navegarDetalle(-1)" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);background:rgba(255,255,255,0.92);border:1px solid #ddd;width:34px;height:34px;border-radius:50%;font-size:1.4rem;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#555;box-shadow:0 2px 8px rgba(0,0,0,0.1);">&#8249;</button>' +
      '<button id="detalleFlechaDer"  onclick="navegarDetalle(1)"  style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:rgba(255,255,255,0.92);border:1px solid #ddd;width:34px;height:34px;border-radius:50%;font-size:1.4rem;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#555;box-shadow:0 2px 8px rgba(0,0,0,0.1);">&#8250;</button>' +
    '</div>' +
    '<div id="detalleThumbs" style="display:flex;gap:8px;padding:10px 16px;overflow-x:auto;border-bottom:1px solid #f0f0f0;flex-shrink:0;scrollbar-width:none;"></div>' +
    '<div style="overflow-y:auto;padding:18px 20px;flex:1;">' +
      '<div id="detalleCategoria" style="font-size:0.72rem;color:var(--rojo);text-transform:uppercase;font-weight:700;letter-spacing:0.06em;margin-bottom:4px;"></div>' +
      '<div id="detalleNombre" style="font-size:1.05rem;font-weight:700;color:#222;margin-bottom:10px;"></div>' +
      '<div style="display:flex;align-items:baseline;gap:10px;margin-bottom:6px;">' +
        '<span id="detallePrecio" style="font-size:1.35rem;font-weight:800;color:var(--rojo);"></span>' +
        '<span id="detallePrecioAntes" style="font-size:0.85rem;color:#aaa;text-decoration:line-through;"></span>' +
      '</div>' +
      '<div id="detalleStock" style="font-size:0.82rem;font-weight:600;margin-bottom:18px;"></div>' +
      '<div id="detalleAcciones"></div>' +
    '</div>';

  document.body.appendChild(modal);
}

function abrirDetalle(ids) {
  var todos = JSON.parse(localStorage.getItem("productosDB") || "[]");
  _detalleVariantes = ids.map(function(id) {
    return todos.find(function(p) { return p.id === id; });
  }).filter(Boolean);
  if (_detalleVariantes.length === 0) return;
  _detalleIndice = 0;
  document.getElementById("fondoDetalle").style.display = "block";
  document.getElementById("modalDetalle").style.display = "flex";
  document.body.style.overflow = "hidden";
  renderizarDetalle();
}

function cerrarDetalle() {
  document.getElementById("fondoDetalle").style.display = "none";
  document.getElementById("modalDetalle").style.display = "none";
  document.body.style.overflow = "";
}

function navegarDetalle(dir) {
  _detalleIndice = (_detalleIndice + dir + _detalleVariantes.length) % _detalleVariantes.length;
  renderizarDetalle();
}

function seleccionarVariante(idx) {
  _detalleIndice = idx;
  renderizarDetalle();
}

function renderizarDetalle() {
  var v = _detalleVariantes[_detalleIndice];
  if (!v) return;

  var usuarioData = localStorage.getItem("usuarioLogueado");
  var esAdmin  = usuarioData ? JSON.parse(usuarioData).esAdmin === true : false;
  var logueado = !!usuarioData;
  var tieneVariantes = _detalleVariantes.length > 1;

  document.getElementById("detalleGrupoNombre").textContent =
    tieneVariantes ? obtenerNombreGrupo(_detalleVariantes) : v.nombre;
  document.getElementById("detalleImg").src = resolverImagen(v.imagen);
  document.getElementById("detalleImg").alt = v.nombre;

  var fi = document.getElementById("detalleFlechaIzq");
  var fd = document.getElementById("detalleFlechaDer");
  if (fi) fi.style.display = tieneVariantes ? "flex" : "none";
  if (fd) fd.style.display = tieneVariantes ? "flex" : "none";

  // MINIATURAS
  var thumbsEl = document.getElementById("detalleThumbs");
  thumbsEl.style.display = tieneVariantes ? "flex" : "none";
  if (tieneVariantes) {
    thumbsEl.innerHTML = "";
    _detalleVariantes.forEach(function(vari, idx) {
      var wrap = document.createElement("div");
      wrap.style.cssText = "position:relative;flex-shrink:0;cursor:pointer;text-align:center;";

      var img = document.createElement("img");
      img.src = resolverImagen(vari.imagen);
      img.alt = vari.nombre;
      img.style.cssText = "width:56px;height:56px;object-fit:cover;border-radius:8px;border:2px solid " +
        (idx === _detalleIndice ? "var(--rojo)" : "#e0e0e0") + ";display:block;transition:border-color 0.15s;";
      img.onclick = (function(i) { return function() { seleccionarVariante(i); }; })(idx);
      wrap.appendChild(img);

      var lbl = document.createElement("div");
      lbl.style.cssText = "font-size:0.64rem;margin-top:3px;width:56px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:" +
        (idx === _detalleIndice ? "var(--rojo)" : "#999") + ";font-weight:" + (idx === _detalleIndice ? "700" : "400") + ";";
      lbl.textContent = vari.nombre;
      wrap.appendChild(lbl);

      if (esAdmin) {
        var be = document.createElement("button");
        be.innerHTML = "✏";
        be.title = "Editar variante";
        be.style.cssText = "position:absolute;top:-5px;right:-5px;width:18px;height:18px;border-radius:50%;background:var(--rojo);border:none;color:white;font-size:0.55rem;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;";
        be.onclick = (function(id) {
          return function(e) { e.stopPropagation(); cerrarDetalle(); abrirModalProducto(id); };
        })(vari.id);
        wrap.appendChild(be);
      }

      thumbsEl.appendChild(wrap);
    });
  }

  document.getElementById("detalleCategoria").textContent = v.categoria;
  document.getElementById("detalleNombre").textContent = v.nombre;
  document.getElementById("detallePrecio").textContent = "S/ " + v.precio.toFixed(2);

  var paEl = document.getElementById("detallePrecioAntes");
  paEl.textContent = v.precioAntes ? "S/ " + v.precioAntes.toFixed(2) : "";
  paEl.style.display = v.precioAntes ? "inline" : "none";

  var stockEl = document.getElementById("detalleStock");
  if (v.stock === 0) {
    stockEl.innerHTML = '<span style="color:#e74c3c;">✗ Sin stock</span>';
  } else if (v.stock <= 10) {
    stockEl.innerHTML = '<span style="color:#f39c12;">⚠ Últimas ' + v.stock + ' unidades</span>';
  } else {
    stockEl.innerHTML = '<span style="color:#27ae60;">✓ En stock</span>';
  }

  var ac = document.getElementById("detalleAcciones");
  if (esAdmin) {
    ac.innerHTML =
      '<button onclick="cerrarDetalle();abrirModalProducto(' + v.id + ');" ' +
      'style="width:100%;background:white;color:var(--rojo);border:2px solid var(--rojo);padding:12px;border-radius:8px;font-size:0.92rem;font-weight:700;cursor:pointer;">' +
      '✏️ Editar esta variante</button>';
  } else if (v.stock === 0) {
    ac.innerHTML = '<button disabled style="width:100%;background:#ddd;color:#aaa;border:none;padding:12px;border-radius:8px;font-size:0.92rem;font-weight:600;cursor:not-allowed;">Sin stock</button>';
  } else if (logueado) {
    ac.innerHTML =
      '<div style="display:flex;align-items:center;gap:12px;">' +
        '<div style="display:flex;align-items:center;gap:8px;border:2px solid #e0e0e0;border-radius:8px;padding:8px 12px;">' +
          '<button onclick="cambiarCantidadDetalle(-1)" style="background:none;border:none;font-size:1.3rem;font-weight:700;cursor:pointer;color:var(--rojo);line-height:1;padding:0;">−</button>' +
          '<span id="detalleCantidad" style="font-size:1rem;font-weight:700;min-width:22px;text-align:center;">1</span>' +
          '<button onclick="cambiarCantidadDetalle(1)"  style="background:none;border:none;font-size:1.3rem;font-weight:700;cursor:pointer;color:var(--rojo);line-height:1;padding:0;">+</button>' +
        '</div>' +
        '<button onclick="agregarDesdeDetalle(' + v.id + ')" ' +
        'style="flex:1;background:var(--rojo);color:white;border:none;padding:12px;border-radius:8px;font-size:0.92rem;font-weight:700;cursor:pointer;">Agregar al carrito</button>' +
      '</div>';
  } else {
    ac.innerHTML =
      '<button onclick="cerrarDetalle();mostrarAvisoLogin();" ' +
      'style="width:100%;background:var(--rojo);color:white;border:none;padding:12px;border-radius:8px;font-size:0.92rem;font-weight:700;cursor:pointer;">Iniciar sesión para comprar</button>';
  }
}

function cambiarCantidadDetalle(dir) {
  var v = _detalleVariantes[_detalleIndice];
  if (!v) return;
  var el = document.getElementById("detalleCantidad");
  if (!el) return;
  var nuevo = Math.min(Math.max(1, parseInt(el.textContent) + dir), v.stock);
  el.textContent = nuevo;
}

function agregarDesdeDetalle(id) {
  var v = _detalleVariantes.find(function(p) { return p.id === id; });
  if (!v) return;
  var el = document.getElementById("detalleCantidad");
  var cantidad = el ? parseInt(el.textContent) : 1;
  var yaEsta = carrito.find(function(p) { return p.id === id; });
  if (yaEsta) {
    yaEsta.cantidad += cantidad;
  } else {
    var item = Object.assign({}, v);
    item.cantidad = cantidad;
    carrito.push(item);
  }
  guardarCarrito();
  actualizarCarrito();
  if (el) el.textContent = "1";
  mostrarAlerta(v.nombre + " agregado al carrito.", "exito");
}

// INICIALIZAR PANEL AL CARGAR
crearPanelCarrito();

// MODAL AGREGAR / EDITAR PRODUCTO (admin)
var _productoEditandoId = null;

// IMAGEN DEL MODAL
var _imagenBase64 = null;

function procesarImagenArchivo(input) {
  if (!input.files || !input.files[0]) return;
  var archivo = input.files[0];
  var reader = new FileReader();
  reader.onload = function(e) {
    _imagenBase64 = e.target.result;
    mostrarPreviewImagen(_imagenBase64);
    document.getElementById("mpImagen").style.display = "none";
    document.getElementById("mpImagen").value = "";
  };
  reader.readAsDataURL(archivo);
}

function mostrarInputUrl() {
  _imagenBase64 = null;
  document.getElementById("mpImagen").style.display = "block";
  document.getElementById("mpImagen").oninput = function() {
    var url = this.value.trim();
    if (url) mostrarPreviewImagen(url);
  };
}

function mostrarPreviewImagen(src) {
  var preview = document.getElementById("mpImagenPreviewImg");
  var texto   = document.getElementById("mpImagenPreviewTexto");
  if (!preview || !texto) return;
  preview.src = src;
  preview.style.display = "block";
  texto.style.display = "none";
}

function limpiarPreviewImagen() {
  _imagenBase64 = null;
  var preview = document.getElementById("mpImagenPreviewImg");
  var texto   = document.getElementById("mpImagenPreviewTexto");
  if (preview) { preview.src = ""; preview.style.display = "none"; }
  if (texto) texto.style.display = "block";
  var inputUrl = document.getElementById("mpImagen");
  if (inputUrl) { inputUrl.value = ""; inputUrl.style.display = "none"; }
  var inputFile = document.getElementById("mpImagenArchivo");
  if (inputFile) inputFile.value = "";
}

function toggleAnexar() {
  var checked = document.getElementById("mpAnexar").checked;
  document.getElementById("mpAnexarSelect").style.display = checked ? "block" : "none";
  if (checked) {
    var sel = document.getElementById("mpProductoPadre");
    sel.innerHTML = '<option value="">-- Selecciona un producto --</option>';
    productos.filter(function(p) {
      return p.activo !== false && p.id !== _productoEditandoId;
    }).forEach(function(p) {
      var opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.nombre + (p.grupoId ? "  ★ ya en grupo" : "");
      sel.appendChild(opt);
    });
  }
}

function quitarDeGrupo(id) {
  mostrarConfirm(
    "¿Quitar este producto del grupo? Pasará a ser un producto independiente.",
    async function() {
      var resultado = await apiPatch("/productos/" + id + "/stock", { stock: 0, grupo_id: null }, true);
      // Usamos PUT para actualizar grupo_id a null
      var prod = productos.find(function(p) { return p.id === id; });
      if (prod) {
        var res = await apiPut("/productos/" + id, {
          nombre:      prod.nombre,
          categoria:   prod.categoria,
          precio:      prod.precio,
          precio_antes: prod.precioAntes,
          oferta:      prod.oferta,
          tipo_oferta: prod.tipoOferta,
          fecha_fin:   prod.fechaFin,
          stock:       prod.stock,
          nuevo:       prod.nuevo,
          grupo_id:    null
        }, true);
        if (res && res.data.ok) {
          productos = await cargarProductosDesdeAPI();
          cerrarModalProducto();
          mostrarProductos(productos);
        }
      }
    }
  );
}

function crearModalProducto() {
  var fondo = document.createElement("div");
  fondo.id = "fondoModalProducto";
  fondo.onclick = cerrarModalProducto;
  fondo.style.cssText = "display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:2000;";
  document.body.appendChild(fondo);

  var modal = document.createElement("div");
  modal.id = "modalProducto";
  modal.style.cssText = "display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:92%;max-width:500px;max-height:90vh;background:white;border-radius:16px;z-index:2001;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.2);overflow:hidden;";
  modal.innerHTML =
    '<div style="background:var(--rojo);color:white;padding:18px 20px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">' +
      '<h3 id="mpTitulo" style="font-size:1rem;font-weight:700;">Agregar producto</h3>' +
      '<button onclick="cerrarModalProducto()" style="background:transparent;border:none;color:white;font-size:1.2rem;cursor:pointer;padding:4px 8px;">✕</button>' +
    '</div>' +
    '<div style="overflow-y:auto;padding:20px;flex:1;">' +
      // NOMBRE
      '<div style="margin-bottom:14px;">' +
        '<label style="display:block;font-size:0.78rem;font-weight:700;text-transform:uppercase;color:#888;margin-bottom:5px;">Nombre</label>' +
        '<input type="text" id="mpNombre" style="width:100%;padding:10px 12px;border:2px solid #e0e0e0;border-radius:8px;font-size:0.92rem;outline:none;font-family:Segoe UI,sans-serif;" placeholder="Ej: Leche Entera 1L">' +
      '</div>' +
      // PRECIO + PRECIO ANTES
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;">' +
        '<div>' +
          '<label style="display:block;font-size:0.78rem;font-weight:700;text-transform:uppercase;color:#888;margin-bottom:5px;">Precio (S/)</label>' +
          '<input type="number" id="mpPrecio" step="0.01" min="0" style="width:100%;padding:10px 12px;border:2px solid #e0e0e0;border-radius:8px;font-size:0.92rem;outline:none;" placeholder="0.00">' +
        '</div>' +
        '<div>' +
          '<label style="display:block;font-size:0.78rem;font-weight:700;text-transform:uppercase;color:#888;margin-bottom:5px;">Precio anterior (S/)</label>' +
          '<input type="number" id="mpPrecioAntes" step="0.01" min="0" style="width:100%;padding:10px 12px;border:2px solid #e0e0e0;border-radius:8px;font-size:0.92rem;outline:none;" placeholder="Vacío si no aplica">' +
        '</div>' +
      '</div>' +
      // CATEGORÍA + STOCK
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;">' +
        '<div>' +
          '<label style="display:block;font-size:0.78rem;font-weight:700;text-transform:uppercase;color:#888;margin-bottom:5px;">Categoría</label>' +
          '<select id="mpCategoria" style="width:100%;padding:10px 12px;border:2px solid #e0e0e0;border-radius:8px;font-size:0.92rem;outline:none;background:white;">' +
            '<option value="lacteos">Lácteos</option>' +
            '<option value="carnes">Carnes</option>' +
            '<option value="frutas">Frutas</option>' +
            '<option value="bebidas">Bebidas</option>' +
            '<option value="limpieza">Limpieza</option>' +
            '<option value="verduras">Verduras</option>' +
            '<option value="galletas">Galletas</option>' +
            '<option value="otros">Otros</option>' +
          '</select>' +
        '</div>' +
        '<div>' +
          '<label style="display:block;font-size:0.78rem;font-weight:700;text-transform:uppercase;color:#888;margin-bottom:5px;">Stock</label>' +
          '<input type="number" id="mpStock" min="0" style="width:100%;padding:10px 12px;border:2px solid #e0e0e0;border-radius:8px;font-size:0.92rem;outline:none;" placeholder="0">' +
        '</div>' +
      '</div>' +
      // IMAGEN
      '<div style="margin-bottom:14px;">' +
        '<label style="display:block;font-size:0.78rem;font-weight:700;text-transform:uppercase;color:#888;margin-bottom:5px;">Imagen</label>' +
        '<div id="mpImagenPreview" style="width:100%;height:120px;border:2px dashed #e0e0e0;border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:8px;overflow:hidden;background:#fafafa;">' +
          '<span id="mpImagenPreviewTexto" style="color:#bbb;font-size:0.85rem;">Sin imagen seleccionada</span>' +
          '<img id="mpImagenPreviewImg" style="display:none;width:100%;height:100%;object-fit:cover;" alt="preview">' +
        '</div>' +
        '<div style="display:flex;gap:8px;">' +
          '<button type="button" onclick="document.getElementById(\'mpImagenArchivo\').click()" style="flex:1;padding:9px;border:2px solid var(--borde);border-radius:8px;background:white;font-size:0.85rem;font-weight:600;cursor:pointer;color:var(--texto);transition:all 0.2s;" onmouseover="this.style.borderColor=\'var(--rojo)\';this.style.color=\'var(--rojo)\';" onmouseout="this.style.borderColor=\'var(--borde)\';this.style.color=\'var(--texto)\';">📁 Subir desde ordenador</button>' +
          '<button type="button" onclick="mostrarInputUrl()" style="flex:1;padding:9px;border:2px solid var(--borde);border-radius:8px;background:white;font-size:0.85rem;font-weight:600;cursor:pointer;color:var(--texto);transition:all 0.2s;" onmouseover="this.style.borderColor=\'var(--rojo)\';this.style.color=\'var(--rojo)\';" onmouseout="this.style.borderColor=\'var(--borde)\';this.style.color=\'var(--texto)\';">🔗 Usar URL</button>' +
        '</div>' +
        '<input type="file" id="mpImagenArchivo" accept="image/*" style="display:none;" onchange="procesarImagenArchivo(this)">' +
        '<input type="text" id="mpImagen" style="display:none;width:100%;padding:10px 12px;border:2px solid #e0e0e0;border-radius:8px;font-size:0.92rem;outline:none;font-family:Segoe UI,sans-serif;margin-top:8px;" placeholder="https://...">' +
      '</div>' +
      // TIPO DE OFERTA
      '<div style="margin-bottom:14px;">' +
        '<label style="display:block;font-size:0.78rem;font-weight:700;text-transform:uppercase;color:#888;margin-bottom:8px;">Tipo de oferta</label>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap;">' +
          '<label style="display:flex;align-items:center;gap:6px;font-size:0.88rem;cursor:pointer;"><input type="radio" name="mpTipoOferta" value="ninguna" checked> Ninguna</label>' +
          '<label style="display:flex;align-items:center;gap:6px;font-size:0.88rem;cursor:pointer;"><input type="radio" name="mpTipoOferta" value="descuento"> Descuento</label>' +
          '<label style="display:flex;align-items:center;gap:6px;font-size:0.88rem;cursor:pointer;"><input type="radio" name="mpTipoOferta" value="pocas"> Últimas unidades</label>' +
          '<label style="display:flex;align-items:center;gap:6px;font-size:0.88rem;cursor:pointer;"><input type="radio" name="mpTipoOferta" value="temporal"> Tiempo limitado</label>' +
        '</div>' +
      '</div>' +
      // FECHA FIN
      '<div style="margin-bottom:14px;" id="mpFechaFinContenedor">' +
        '<label style="display:block;font-size:0.78rem;font-weight:700;text-transform:uppercase;color:#888;margin-bottom:5px;">Fecha fin de oferta</label>' +
        '<input type="date" id="mpFechaFin" style="width:100%;padding:10px 12px;border:2px solid #e0e0e0;border-radius:8px;font-size:0.92rem;outline:none;">' +
      '</div>' +
      // NUEVO
      '<label style="display:flex;align-items:center;gap:8px;font-size:0.9rem;cursor:pointer;margin-bottom:4px;">' +
        '<input type="checkbox" id="mpNuevo" style="width:16px;height:16px;accent-color:var(--rojo);"> ' +
        'Marcar como <strong>Nuevo</strong>' +
      '</label>' +
      // SECCIÓN ANEXAR
      '<div style="margin-top:16px;padding-top:14px;border-top:1px solid #f0f0f0;">' +
        '<label style="display:flex;align-items:center;gap:8px;font-size:0.88rem;cursor:pointer;">' +
          '<input type="checkbox" id="mpAnexar" style="width:16px;height:16px;accent-color:var(--rojo);" onchange="toggleAnexar()"> ' +
          'Anexar con otro producto <span style="color:#aaa;font-weight:400;font-size:0.78rem;">(crear variante)</span>' +
        '</label>' +
        '<div id="mpAnexarSelect" style="display:none;margin-top:10px;">' +
          '<label style="display:block;font-size:0.78rem;font-weight:700;text-transform:uppercase;color:#888;margin-bottom:5px;">Producto al que anexar</label>' +
          '<select id="mpProductoPadre" style="width:100%;padding:10px 12px;border:2px solid #e0e0e0;border-radius:8px;font-size:0.88rem;outline:none;background:white;">' +
            '<option value="">-- Selecciona --</option>' +
          '</select>' +
          '<p style="font-size:0.74rem;color:#bbb;margin-top:6px;line-height:1.5;">Cada variante conserva su propio precio, stock e imagen.</p>' +
        '</div>' +
        '<div id="mpGrupoInfo" style="display:none;margin-top:10px;"></div>' +
      '</div>' +
    '</div>' +
    '<div style="padding:16px 20px;border-top:2px solid #e0e0e0;background:#fafafa;display:flex;gap:10px;flex-shrink:0;">' +
      '<button onclick="guardarProducto()" style="flex:1;background:var(--rojo);color:white;border:none;padding:12px;border-radius:8px;font-size:0.92rem;font-weight:700;cursor:pointer;">Guardar</button>' +
      '<button id="mpBtnEliminar" onclick="eliminarProducto()" style="display:none;background:white;color:#c0392b;border:2px solid #c0392b;padding:12px 18px;border-radius:8px;font-size:0.92rem;font-weight:700;cursor:pointer;">Eliminar</button>' +
    '</div>';

  document.body.appendChild(modal);

  // Mostrar fecha fin según tipo de oferta
  document.addEventListener("change", function(e) {
    if (e.target.name === "mpTipoOferta") {
      var mostrar = e.target.value === "temporal" || e.target.value === "descuento";
      document.getElementById("mpFechaFinContenedor").style.display = mostrar ? "block" : "none";
    }
  });
}

function abrirModalProducto(id) {
  _productoEditandoId = id;
  var esNuevo = id === null;
  document.getElementById("mpTitulo").textContent = esNuevo ? "Agregar producto" : "Editar producto";
  document.getElementById("mpBtnEliminar").style.display = esNuevo ? "none" : "block";

  if (esNuevo) {
    document.getElementById("mpNombre").value = "";
    document.getElementById("mpPrecio").value = "";
    document.getElementById("mpPrecioAntes").value = "";
    document.getElementById("mpStock").value = "";
    limpiarPreviewImagen();
    document.getElementById("mpCategoria").value = "lacteos";
    document.getElementById("mpNuevo").checked = false;
    document.getElementById("mpFechaFin").value = "";
    document.querySelector('input[name="mpTipoOferta"][value="ninguna"]').checked = true;
    document.getElementById("mpFechaFinContenedor").style.display = "none";
    var mpAnexarN = document.getElementById("mpAnexar");
    if (mpAnexarN) { mpAnexarN.checked = false; mpAnexarN.disabled = false; }
    var mpAnexarSelN = document.getElementById("mpAnexarSelect");
    if (mpAnexarSelN) mpAnexarSelN.style.display = "none";
    var mpGrupoInfoN = document.getElementById("mpGrupoInfo");
    if (mpGrupoInfoN) { mpGrupoInfoN.style.display = "none"; mpGrupoInfoN.innerHTML = ""; }
  } else {
    var todosDB = JSON.parse(localStorage.getItem("productosDB") || "[]");
    var p = productos.find(function(x) { return x.id === id; });
    if (!p) return;
    document.getElementById("mpNombre").value = p.nombre || "";
    document.getElementById("mpPrecio").value = p.precio || "";
    document.getElementById("mpPrecioAntes").value = p.precioAntes || "";
    document.getElementById("mpStock").value = p.stock || 0;
    var imgGuardada = p.imagen || "";
    if (imgGuardada.startsWith("data:")) {
      // Base64 guardada
      _imagenBase64 = imgGuardada;
      document.getElementById("mpImagen").style.display = "none";
      document.getElementById("mpImagen").value = "";
      mostrarPreviewImagen(imgGuardada);
    } else if (imgGuardada.startsWith("http")) {
      // URL
      _imagenBase64 = null;
      document.getElementById("mpImagen").style.display = "block";
      document.getElementById("mpImagen").value = imgGuardada;
      mostrarPreviewImagen(imgGuardada);
    } else {
      // Archivo local
      _imagenBase64 = null;
      document.getElementById("mpImagen").style.display = "block";
      document.getElementById("mpImagen").value = imgGuardada;
      mostrarPreviewImagen(resolverImagen(imgGuardada));
}
    document.getElementById("mpCategoria").value = p.categoria || "otros";
    document.getElementById("mpNuevo").checked = p.nuevo || false;
    document.getElementById("mpFechaFin").value = p.fechaFin || "";
    var tipo = p.tipoOferta || "ninguna";
    var radio = document.querySelector('input[name="mpTipoOferta"][value="' + tipo + '"]');
    if (radio) radio.checked = true;
    document.getElementById("mpFechaFinContenedor").style.display =
      (tipo === "temporal" || tipo === "descuento") ? "block" : "none";
    var mpAnexarE = document.getElementById("mpAnexar");
    var mpAnexarSelE = document.getElementById("mpAnexarSelect");
    var mpGrupoInfoE = document.getElementById("mpGrupoInfo");
    if (p.grupoId) {
      if (mpAnexarE) { mpAnexarE.checked = false; mpAnexarE.disabled = true; }
      if (mpAnexarSelE) mpAnexarSelE.style.display = "none";
      if (mpGrupoInfoE) {
        mpGrupoInfoE.style.display = "block";
        mpGrupoInfoE.innerHTML =
          '<div style="background:#ffeaea;border-radius:8px;padding:10px 12px;font-size:0.84rem;color:#c0392b;display:flex;justify-content:space-between;align-items:center;gap:10px;">' +
            '<span>📎 Parte de un grupo de variantes</span>' +
            '<button onclick="quitarDeGrupo(' + p.id + ')" style="background:none;border:1px solid #c0392b;color:#c0392b;border-radius:6px;padding:4px 10px;cursor:pointer;font-size:0.78rem;font-weight:600;white-space:nowrap;">Quitar del grupo</button>' +
          '</div>';
      }
    } else {
      if (mpAnexarE) { mpAnexarE.checked = false; mpAnexarE.disabled = false; }
      if (mpAnexarSelE) mpAnexarSelE.style.display = "none";
      if (mpGrupoInfoE) { mpGrupoInfoE.style.display = "none"; mpGrupoInfoE.innerHTML = ""; }
    }
  }

  document.getElementById("fondoModalProducto").style.display = "block";
  document.getElementById("modalProducto").style.display = "flex";
  document.body.style.overflow = "hidden";
}

function cerrarModalProducto() {
  document.getElementById("fondoModalProducto").style.display = "none";
  document.getElementById("modalProducto").style.display = "none";
  document.body.style.overflow = "";
}

async function guardarProducto() {
  var nombre      = document.getElementById("mpNombre").value.trim();
  var precio      = parseFloat(document.getElementById("mpPrecio").value);
  var precioAntes = parseFloat(document.getElementById("mpPrecioAntes").value) || null;
  var stock       = parseInt(document.getElementById("mpStock").value) || 0;
  var categoria   = document.getElementById("mpCategoria").value;
  var nuevo       = document.getElementById("mpNuevo").checked;
  var fechaFin    = document.getElementById("mpFechaFin").value || null;
  var tipoOferta  = document.querySelector('input[name="mpTipoOferta"]:checked').value;

  if (!nombre || isNaN(precio)) {
    mostrarAlerta("El nombre y el precio son obligatorios.", "error");
    return;
  }

  // DETERMINAR grupoId
  var grupoIdFinal = null;
  var mpAnexarEl   = document.getElementById("mpAnexar");
  var estaAnexando = mpAnexarEl && !mpAnexarEl.disabled && mpAnexarEl.checked;

  if (estaAnexando) {
    var padreIdStr = document.getElementById("mpProductoPadre") ? document.getElementById("mpProductoPadre").value : "";
    if (padreIdStr) {
      var padreId  = parseInt(padreIdStr);
      var resultado = await apiGet("/productos/" + padreId);
      if (resultado && resultado.data.ok) {
        var padre = resultado.data.producto;
        if (padre.grupo_id) {
          grupoIdFinal = padre.grupo_id;
        } else {
          // Crear grupo nuevo
          var nuevoGrupo = await apiPost("/productos/grupos/crear", {
            nombre_grupo: nombre,
            categoria:    categoria
          }, true);
          if (nuevoGrupo && nuevoGrupo.data.ok) {
            grupoIdFinal = nuevoGrupo.data.id;
            // Asignar grupo al padre
            await apiPatch("/productos/" + padreId + "/stock", { stock: padre.stock }, true);
          }
        }
      }
    }
  } else if (_productoEditandoId !== null) {
    var prodActual = productos.find(function(p) { return p.id === _productoEditandoId; });
    if (prodActual && prodActual.grupoId) grupoIdFinal = parseInt(prodActual.grupoId);
  }

  // PREPARAR DATOS
  var body = {
    nombre:      nombre,
    categoria:   categoria,
    precio:      precio,
    precio_antes: precioAntes,
    oferta:      tipoOferta !== "ninguna",
    tipo_oferta: tipoOferta !== "ninguna" ? tipoOferta : null,
    fecha_fin:   fechaFin,
    stock:       stock,
    nuevo:       nuevo,
    grupo_id:    grupoIdFinal
  };

  // IMAGEN
  if (_imagenBase64) {
    body.imagen_url = _imagenBase64;
  } else {
    var imgInput = document.getElementById("mpImagen");
    if (imgInput && imgInput.value.trim()) {
      body.imagen_url = imgInput.value.trim();
    }
  }

  var resultado;
  if (_productoEditandoId === null) {
    resultado = await apiPost("/productos", body, true);
  } else {
    resultado = await apiPut("/productos/" + _productoEditandoId, body, true);
  }

  if (!resultado || !resultado.data.ok) {
    mostrarAlerta(resultado ? resultado.data.mensaje : "Error de conexión", "error");
    return;
  }

  // RECARGAR PRODUCTOS
  productos = await cargarProductosDesdeAPI();
  cerrarModalProducto();
  mostrarProductos(productos);
  mostrarAlerta(
    _productoEditandoId === null ? "Producto agregado correctamente." : "Producto actualizado correctamente.",
    "exito"
  );
}

function eliminarProducto() {
  mostrarConfirm(
    "¿Eliminar este producto? No se mostrará más en la tienda.",
    async function() {
      var resultado = await apiDelete("/productos/" + _productoEditandoId, true);
      if (!resultado || !resultado.data.ok) {
        mostrarAlerta("Error al eliminar el producto.", "error");
        return;
      }
      productos = await cargarProductosDesdeAPI();
      cerrarModalProducto();
      mostrarProductos(productos);
      mostrarAlerta("Producto eliminado correctamente.", "exito");
    }
  );
}

crearModalProducto();
crearModalDetalle();

// MENÚ HAMBURGUESA MÓVIL
function crearDrawerNav() {
  // FONDO OSCURO
  var fondo = document.createElement("div");
  fondo.id = "fondoDrawer";
  fondo.onclick = cerrarDrawer;
  document.body.appendChild(fondo);

  // Detectar página actual para marcar el link activo
  var ruta = window.location.pathname;
  var esIndex    = !ruta.includes("/paginas/");
  var esProductos = ruta.includes("productos.html");
  var esOfertas   = ruta.includes("ofertas.html");
  var esContacto  = ruta.includes("contacto.html");

  var base = ruta.includes("/paginas/") ? "" : "paginas/";

  // DRAWER
  var drawer = document.createElement("div");
  drawer.id = "drawerNav";
  drawer.innerHTML =
    '<div class="drawer-header">' +
      '<a href="' + (base === "" ? "../index.html" : "index.html") + '" class="drawer-logo">Rojo<span> Danés</span></a>' +
      '<button class="btn-cerrar-drawer" onclick="cerrarDrawer()">✕</button>' +
    '</div>' +
    '<nav class="drawer-links">' +
      '<a href="' + (base === "" ? "../index.html" : "index.html") + '"' + (esIndex ? ' class="drawer-activo"' : '') + '>🏠 Inicio</a>' +
      '<a href="' + base + 'productos.html"' + (esProductos ? ' class="drawer-activo"' : '') + '>🛍 Productos</a>' +
      '<a href="' + base + 'ofertas.html"'   + (esOfertas   ? ' class="drawer-activo"' : '') + '>🔥 Ofertas</a>' +
      '<a href="' + base + 'contacto.html"'  + (esContacto  ? ' class="drawer-activo"' : '') + '>📞 Contacto</a>' +
    '</nav>';
  document.body.appendChild(drawer);

  // BOTÓN HAMBURGUESA EN EL NAVBAR
  var navbar = document.getElementById("navbar");
  if (navbar) {
    var btnH = document.createElement("button");
    btnH.className = "btn-hamburguesa";
    btnH.innerHTML = "☰";
    btnH.onclick = abrirDrawer;
    // Insertar al inicio del navbar (antes del logo)
    navbar.insertBefore(btnH, navbar.firstChild);
  }
}

function abrirDrawer() {
  document.getElementById("drawerNav").classList.add("abierto");
  document.getElementById("fondoDrawer").classList.add("visible");
  document.body.style.overflow = "hidden";
}

function cerrarDrawer() {
  document.getElementById("drawerNav").classList.remove("abierto");
  document.getElementById("fondoDrawer").classList.remove("visible");
  document.body.style.overflow = "";
}

crearDrawerNav();