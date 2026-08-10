// OFERTA VIGENTE
function ofertaVigente(producto) {
  if (!producto.oferta) return false;
  if (producto.fechaFin) {
    var hoy    = new Date();
    var limite = new Date(producto.fechaFin);
    return hoy <= limite;
  }
  return producto.stock > 0;
}

// PORCENTAJE DE DESCUENTO
function calcularDescuento(producto) {
  if (!producto.precioAntes) return 0;
  var diff = producto.precioAntes - producto.precio;
  return Math.round((diff / producto.precioAntes) * 100);
}

// FILTRO DE OFERTAS
function filtrarOfertas(tipo, btn) {
  document.querySelectorAll(".oferta-filtro").forEach(function(b) {
    b.classList.remove("activo-oferta");
  });
  if (btn) btn.classList.add("activo-oferta");

  var vigentes = productos.filter(ofertaVigente);

  var resultado = [];
  if (tipo === "todas") {
    resultado = vigentes;
  } else if (tipo === "descuento") {
    resultado = vigentes.filter(function(p) { return p.precioAntes !== null; });
  } else if (tipo === "pocas") {
    resultado = vigentes.filter(function(p) { return p.stock > 0 && p.stock <= 5; });
  } else if (tipo === "temporal") {
    resultado = vigentes.filter(function(p) { return p.fechaFin !== null; });
  }

  mostrarOfertas(resultado);
}

// MOSTRAR OFERTAS
function mostrarOfertas(lista) {
  var grilla  = document.getElementById("grilla-productos");
  var contador = document.getElementById("contadorResultados");

  if (lista.length === 0) {
    grilla.innerHTML =
      '<div class="sin-resultados">' +
        '<p>😕 No hay ofertas en esta categoría por ahora.</p>' +
        '<a href="productos.html" class="btn-ver-todos">Ver todos los productos</a>' +
      '</div>';
    if (contador) contador.textContent = "0 ofertas encontradas";
    return;
  }

  if (contador) {
    contador.textContent = lista.length === 1
      ? "1 oferta encontrada"
      : lista.length + " ofertas encontradas";
  }

  // Mostrar usando el sistema de grupos de script.js
  mostrarProductos(lista);

  // AGREGAR BADGES después de renderizar
  // Esperamos un tick para que el DOM esté listo
  setTimeout(function() {
    lista.forEach(function(producto) {
      var descuento = calcularDescuento(producto);

      // Buscar la tarjeta por id del producto o por grupo
      // En grupos el nombre del titular puede ser diferente,
      // por eso buscamos por data o por coincidencia de precio
      var tarjetas = document.querySelectorAll(".tarjeta:not(.tarjeta-agregar)");

      tarjetas.forEach(function(t) {
        // Verificar si esta tarjeta corresponde al producto
        // Buscamos el botón de detalle que tiene los ids
        var btnDetalle = t.querySelector("[onclick*='" + producto.id + "']");
        if (!btnDetalle) return;

        // BADGE DESCUENTO
        if (descuento > 0 && !t.querySelector(".badge-descuento")) {
          var badge = document.createElement("div");
          badge.className = "badge-descuento";
          badge.textContent = "-" + descuento + "%";
          t.appendChild(badge);
        }

        // BADGE TIEMPO
        if (producto.fechaFin && !t.querySelector(".badge-tiempo")) {
          var hoy    = new Date();
          var limite = new Date(producto.fechaFin);
          var diff   = Math.ceil((limite - hoy) / (1000 * 60 * 60 * 24));
          if (diff <= 7) {
            var timer = document.createElement("div");
            timer.className = "badge-tiempo";
            timer.textContent = diff <= 0 ? "⏳ Último día" : "⏳ " + diff + " días";
            t.appendChild(timer);
          }
        }
      });
    });
  }, 0);
}

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

window.onload = function() {
  verificarSesion();
  cargarProductosDesdeAPI().then(function(lista) {
    productos = lista;
    filtrarOfertas("todas", document.querySelector(".oferta-filtro"));
  });
};