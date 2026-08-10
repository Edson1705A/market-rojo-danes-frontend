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

// ADMIN
var NUMERO_TIENDA  = "51952822589";

var filtroActual = "todos";
var todosPedidos = [];

function cerrarAdmin() {
  localStorage.removeItem("usuarioLogueado");
  window.location.href = "login.html";
}

window.onload = function() {
  // VERIFICAR QUE SEA ADMIN
  var datos = localStorage.getItem("usuarioLogueado");
  if (!datos) {
    window.location.href = "login.html";
    return;
  }
  var usuario = JSON.parse(datos);
  if (!usuario.esAdmin) {
    window.location.href = "../index.html";
    return;
  }
  cargarTodosPedidos();
};

// PEDIDOS DE TODOS LOS USUARIOS
function cargarTodosPedidos() {
  todosPedidos = [];

  // Buscar todas las claves de localStorage que sean pedidos_*
  for (var i = 0; i < localStorage.length; i++) {
    var clave = localStorage.key(i);
    if (clave && clave.indexOf("pedidos_") === 0) {
      var correo  = clave.replace("pedidos_", "");
      var pedidos = JSON.parse(localStorage.getItem(clave) || "[]");
      pedidos.forEach(function(p) {
        p._correoCliente = correo; // anotar a quién pertenece
      });
      todosPedidos = todosPedidos.concat(pedidos);
    }
  }

  // Ordenar por fecha descendente
  todosPedidos.sort(function(a, b) { return b.id - a.id; });

  renderizarAdmin();
}

function filtrarAdmin(estado, btn) {
  filtroActual = estado;
  document.querySelectorAll(".admin-filtro").forEach(function(b) {
    b.classList.remove("activo");
  });
  if (btn) btn.classList.add("activo");
  renderizarAdmin();
}

var clasesEstadoAdmin = {
  procesando:    "estado-procesando",
  "por-recoger": "estado-por-recoger",
  entregado:     "estado-entregado",
  cancelado:     "estado-cancelado"
};
var textosEstadoAdmin = {
  procesando:    "Procesando",
  "por-recoger": "Por recoger",
  entregado:     "Entregado",
  cancelado:     "Cancelado"
};

function renderizarAdmin() {
  var lista = filtroActual === "todos"
    ? todosPedidos
    : todosPedidos.filter(function(p) { return p.estado === filtroActual; });

  var contenedor = document.getElementById("adminListaPedidos");
  var contador   = document.getElementById("adminContador");

  contador.textContent = lista.length === 0
    ? "Sin pedidos"
    : lista.length === 1 ? "1 pedido" : lista.length + " pedidos";

  if (lista.length === 0) {
    contenedor.innerHTML =
      '<div class="admin-vacio">' +
        '<div class="icono">📭</div>' +
        '<p>No hay pedidos en este estado</p>' +
      '</div>';
    return;
  }

  contenedor.innerHTML = "";

  lista.forEach(function(pedido) {
    var itemsTexto = pedido.items.map(function(item) {
      return "• " + item.cantidad + "x " + item.nombre;
    }).join("<br>");

    // Botones de estado actual
    var acciones = "";
    if (pedido.estado === "procesando") {
      acciones =
        '<button class="btn-estado btn-estado-recoger" onclick="cambiarEstado(\'' + pedido._correoCliente + '\',' + pedido.id + ',\'por-recoger\')">✅ Marcar Por recoger</button>' +
        '<button class="btn-estado btn-estado-cancelado" onclick="cambiarEstado(\'' + pedido._correoCliente + '\',' + pedido.id + ',\'cancelado\')">✕ Cancelar</button>';
    } else if (pedido.estado === "por-recoger") {
      acciones =
        '<button class="btn-estado btn-estado-entregado" onclick="cambiarEstado(\'' + pedido._correoCliente + '\',' + pedido.id + ',\'entregado\')">🎉 Marcar Entregado</button>' +
        '<button class="btn-estado btn-estado-cancelado" onclick="cambiarEstado(\'' + pedido._correoCliente + '\',' + pedido.id + ',\'cancelado\')">✕ Cancelar</button>';
    }
    // entregado y cancelado no tienen más acciones

    var card = document.createElement("div");
    card.className = "admin-card";
    card.innerHTML =
      '<div class="admin-card-header">' +
        '<div class="admin-card-left">' +
          '<div class="admin-pedido-id">Pedido #' + pedido.id + '</div>' +
          '<div class="admin-pedido-cliente">👤 ' + pedido._correoCliente + '</div>' +
          '<div class="admin-pedido-fecha">📅 ' + pedido.fecha + '</div>' +
          '<div class="admin-pedido-pago">💳 ' + (pedido.metodoPago || "No especificado") + '</div>' +
        '</div>' +
        '<span class="pedido-estado ' + (clasesEstadoAdmin[pedido.estado] || "estado-procesando") + '">' +
          (textosEstadoAdmin[pedido.estado] || "Procesando") +
        '</span>' +
      '</div>' +
      '<div class="admin-card-items">' + itemsTexto + '</div>' +
      '<div class="admin-card-footer">' +
        '<span class="admin-total">S/ ' + pedido.total.toFixed(2) + '</span>' +
        '<div class="admin-acciones">' + acciones + '</div>' +
      '</div>';

    contenedor.appendChild(card);
  });
}

function cambiarEstado(correo, pedidoId, nuevoEstado) {
  var textos = {
    "por-recoger": "¿Marcar este pedido como <strong>Por recoger</strong>? Se notificará al cliente por WhatsApp.",
    "entregado":   "¿Marcar este pedido como <strong>Entregado</strong>?",
    "cancelado":   "¿Cancelar este pedido?"
  };

  mostrarConfirm(
    textos[nuevoEstado] || "¿Cambiar el estado de este pedido?",
    function() {
      var clave   = "pedidos_" + correo;
      var pedidos = JSON.parse(localStorage.getItem(clave) || "[]");
      var pedido  = pedidos.find(function(p) { return p.id === pedidoId; });
      if (!pedido) return;

      pedido.estado = nuevoEstado;
      localStorage.setItem(clave, JSON.stringify(pedidos));

      if (nuevoEstado === "por-recoger") {
        var itemsTexto = pedido.items.map(function(item) {
          return "• " + item.nombre + " x" + item.cantidad;
        }).join("\n");

        var usuarios   = JSON.parse(localStorage.getItem("usuarios") || "[]");
        var cliente    = usuarios.find(function(u) { return u.correo === correo; });
        var telCliente = cliente && cliente.telefono ? cliente.telefono.replace(/\D/g, "") : null;

        var mensaje =
          "Hola *" + (cliente ? cliente.nombre : correo) + "*, " +
          "tu pedido está *listo para recoger* en tienda 🎉\n\n" +
          "*Pedido #" + pedido.id + "*\n" +
          itemsTexto + "\n\n" +
          "💳 Pago: " + (pedido.metodoPago || "No especificado") + "\n\n" +
          "📍 *Dirección:* Calle Colón Nº112 - Chincha Alta\n" +
          "🕒 *Horario:* Lun–Sáb 7am–10pm | Dom 7:30am–10pm\n\n" +
          "¡Te esperamos!";

        var destino = telCliente || NUMERO_TIENDA;
        window.open(
          "https://wa.me/" + destino + "?text=" + encodeURIComponent(mensaje),
          "_blank"
        );
      }

      cargarTodosPedidos();
    }
  );
}

// TABS
function cambiarTab(tab) {
  document.getElementById("tabPedidos").classList.toggle("activo", tab === "pedidos");
  document.getElementById("tabUsuarios").classList.toggle("activo", tab === "usuarios");
  document.getElementById("seccionPedidos").style.display  = tab === "pedidos"  ? "block" : "none";
  document.getElementById("seccionUsuarios").style.display = tab === "usuarios" ? "block" : "none";
  if (tab === "usuarios") cargarUsuarios();
}

// GESTIÓN DE USUARIOS
function cargarUsuarios() {
  var usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
  var contenedor = document.getElementById("adminListaUsuarios");
  var contador   = document.getElementById("adminContadorUsuarios");

  contador.textContent = usuarios.length === 0
    ? "Sin usuarios registrados"
    : usuarios.length + " usuario" + (usuarios.length !== 1 ? "s" : "") + " registrado" + (usuarios.length !== 1 ? "s" : "");

  if (usuarios.length === 0) {
    contenedor.innerHTML =
      '<div class="admin-vacio"><div class="icono">👥</div><p>No hay usuarios registrados aún</p></div>';
    return;
  }

  contenedor.innerHTML = "";
  usuarios.forEach(function(u) {
    var card = document.createElement("div");
    card.className = "usuario-card" + (u.bloqueado ? " bloqueado" : "");
    card.innerHTML =
      '<div class="usuario-info-admin">' +
        '<div class="usuario-avatar-admin">' + u.nombre.charAt(0).toUpperCase() + '</div>' +
        '<div class="usuario-datos-admin">' +
          '<div class="usuario-nombre-admin">' + u.nombre +
            (u.bloqueado ? '<span class="badge-bloqueado">Bloqueado</span>' : '') +
          '</div>' +
          '<div class="usuario-meta">@' + u.username + ' · ' + u.correo + '</div>' +
          '<div class="usuario-ids">' +
            'ID: ' + (u.id || '—') +
            (u.dni ? ' · DNI: ' + u.dni : '') +
            ' · Registro: ' + (u.fechaRegistro || '—') +
          '</div>' +
        '</div>' +
      '</div>' +
      '<button class="btn-bloquear ' + (u.bloqueado ? 'btn-bloquear-no' : 'btn-bloquear-si') + '" ' +
        'onclick="toggleBloquear(\'' + u.correo + '\')">' +
        (u.bloqueado ? '✅ Desbloquear' : '🚫 Bloquear') +
      '</button>';
    contenedor.appendChild(card);
  });
}

function toggleBloquear(correo) {
  var usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
  var u = usuarios.find(function(x) { return x.correo === correo; });
  if (!u) return;

  var accion = u.bloqueado ? "desbloquear" : "bloquear";
  mostrarConfirm(
    "¿" + (u.bloqueado ? "Desbloquear" : "Bloquear") + " a " + u.nombre + "?",
    function() {
      u.bloqueado = !u.bloqueado;
      localStorage.setItem("usuarios", JSON.stringify(usuarios));
      if (u.bloqueado) {
        var sesion = localStorage.getItem("usuarioLogueado");
        if (sesion && JSON.parse(sesion).correo === correo) {
          localStorage.removeItem("usuarioLogueado");
        }
      }
      cargarUsuarios();
    }
  );
}