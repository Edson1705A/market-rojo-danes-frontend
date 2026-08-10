function protegerPaginaPedidos() {
  var datos = localStorage.getItem("usuarioLogueado");
  if (!datos) {
    window.location.href = "login.html";
    return null;
  }
  return JSON.parse(datos);
}

function cargarSidebarPedidos(usuario) {
  document.getElementById("avatarPerfil").textContent = usuario.nombre.charAt(0).toUpperCase();
  document.getElementById("nombrePerfil").textContent = usuario.nombre;
  document.getElementById("correoPerfil").textContent = usuario.correo;
}

var clasesEstado = {
  procesando:    "estado-procesando",
  "por-recoger": "estado-por-recoger",
  entregado:     "estado-entregado",
  cancelado:     "estado-cancelado"
};
var textosEstado = {
  procesando:    "Procesando",
  "por-recoger": "Por recoger",
  entregado:     "Entregado",
  cancelado:     "Cancelado"
};

// ACCESO CLIENTE
var estadosCancelables = ["procesando"];

function cancelarPedido(pedidoId) {
  var usuario = JSON.parse(localStorage.getItem("usuarioLogueado"));
  if (!usuario) return;

  mostrarConfirm(
    "¿Seguro que quieres cancelar este pedido? Se notificará al personal.",
    function() {
      var clave   = "pedidos_" + usuario.correo;
      var pedidos = JSON.parse(localStorage.getItem(clave) || "[]");
      var pedido  = pedidos.find(function(p) { return p.id === pedidoId; });
      if (!pedido) return;

      pedido.estado = "cancelado";
      localStorage.setItem(clave, JSON.stringify(pedidos));

      var itemsTexto = pedido.items.map(function(item) {
        return "• " + item.nombre + " x" + item.cantidad;
      }).join("\n");

      var mensaje =
        "⚠️ *PEDIDO CANCELADO*\n\n" +
        "El cliente *" + usuario.nombre + "* ha cancelado su pedido.\n\n" +
        "*Pedido #" + pedido.id + "*\n" +
        itemsTexto + "\n\n" +
        "💳 Método de pago: " + (pedido.metodoPago || "No especificado") + "\n" +
        "📅 Fecha original: " + pedido.fecha;

      var numero = "51952822589";
      window.open("https://wa.me/" + numero + "?text=" + encodeURIComponent(mensaje), "_blank");

      mostrarPedidos(pedidos);
    }
  );
}

function mostrarPedidos(pedidos) {
  var contenedor = document.getElementById("listaPedidos");
  var contador   = document.getElementById("contadorPedidos");

  if (!pedidos || pedidos.length === 0) {
    contador.textContent = "Aún no tienes pedidos";
    contenedor.innerHTML =
      '<div class="cuenta-vacio">' +
        '<div class="icono">📦</div>' +
        '<p>Todavía no has realizado ningún pedido.<br>¡Explora nuestros productos y haz tu primera compra!</p>' +
        '<a href="productos.html" class="btn-auth" style="text-decoration:none; display:inline-block; margin-top:10px;">Ver productos</a>' +
      '</div>';
    return;
  }

  contador.textContent = pedidos.length === 1
    ? "1 pedido encontrado"
    : pedidos.length + " pedidos encontrados";

  contenedor.innerHTML = "";
  var ordenados = pedidos.slice().reverse();

  ordenados.forEach(function(pedido) {
    var itemsTexto = pedido.items.map(function(item) {
      return item.cantidad + "x " + item.nombre;
    }).join(", ");

    var puedeCancel = estadosCancelables.indexOf(pedido.estado) !== -1;

    var card = document.createElement("div");
    card.className = "pedido-card";
    card.innerHTML =
      '<div class="pedido-header">' +
        '<div>' +
          '<div class="pedido-id">Pedido #' + pedido.id + '</div>' +
          '<div class="pedido-fecha">' + pedido.fecha + '</div>' +
        '</div>' +
        '<span class="pedido-estado ' + (clasesEstado[pedido.estado] || "estado-procesando") + '">' +
          (textosEstado[pedido.estado] || "Procesando") +
        '</span>' +
      '</div>' +
      '<div class="pedido-items">' + itemsTexto + '</div>' +
      '<div class="pedido-footer">' +
        '<span class="pedido-total">S/ ' + pedido.total.toFixed(2) + '</span>' +
        (pedido.metodoPago
          ? '<span class="pedido-pago">💳 ' + pedido.metodoPago + '</span>'
          : '') +
        (puedeCancel
          ? '<button class="btn-cancelar-pedido" onclick="cancelarPedido(' + pedido.id + ')">Cancelar pedido</button>'
          : '') +
      '</div>';

    contenedor.appendChild(card);
  });
}

window.onload = function() {
  var usuario = protegerPaginaPedidos();
  if (!usuario) return;
  verificarSesion();
  cargarSidebarPedidos(usuario);

  if (usuario.esAdmin) {
    // ADMIN: redirigir al panel que ya tiene todos los pedidos
    var contador = document.getElementById("contadorPedidos");
    var lista    = document.getElementById("listaPedidos");
    if (contador) contador.textContent = "Vista de administrador";
    if (lista) lista.innerHTML =
      '<div class="cuenta-vacio">' +
        '<div class="icono">⚙️</div>' +
        '<p>Como administrador, gestiona todos los pedidos desde el panel admin.</p>' +
        '<a href="admin.html" class="btn-auth" style="text-decoration:none;display:inline-block;margin-top:10px;">Ir al panel admin</a>' +
      '</div>';
    return;
  }

  var pedidos = JSON.parse(localStorage.getItem("pedidos_" + usuario.correo) || "[]");
  mostrarPedidos(pedidos);
};