function protegerPagina() {
  var datos = localStorage.getItem("usuarioLogueado");
  if (!datos) {
    window.location.href = "login.html";
    return null;
  }
  return JSON.parse(datos);
}

function ocultarMensajesPerfil() {
  document.getElementById("mensajeError").classList.add("oculto");
  document.getElementById("mensajeExito").classList.add("oculto");
}

// PERFIL NORMAL — cliente
function cargarPerfil(usuario) {
  document.getElementById("avatarPerfil").textContent = usuario.nombre.charAt(0).toUpperCase();
  document.getElementById("nombrePerfil").textContent = usuario.nombre;
  document.getElementById("correoPerfil").textContent = usuario.correo;
  document.getElementById("inputNombre").value   = usuario.nombre   || "";
  document.getElementById("inputUsername").value = usuario.username || "";
  document.getElementById("inputCorreo").value   = usuario.correo   || "";
  document.getElementById("inputTelefono").value = usuario.telefono || "";
  document.getElementById("fechaRegistroPerfil").textContent =
    usuario.fechaRegistro || "Fecha no disponible";
}

function guardarPerfil() {
  ocultarMensajesPerfil();

  var nombre   = document.getElementById("inputNombre").value.trim();
  var telefono = document.getElementById("inputTelefono").value.trim();

  if (!nombre) {
    var elErr = document.getElementById("mensajeError");
    elErr.textContent = "⚠️ El nombre no puede estar vacío.";
    elErr.classList.remove("oculto");
    return;
  }

  var usuarioActual = JSON.parse(localStorage.getItem("usuarioLogueado"));
  usuarioActual.nombre   = nombre;
  usuarioActual.telefono = telefono;
  localStorage.setItem("usuarioLogueado", JSON.stringify(usuarioActual));

  var usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
  var idx = usuarios.findIndex(function(u) { return u.correo === usuarioActual.correo; });
  if (idx !== -1) {
    usuarios[idx] = usuarioActual;
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
  }

  cargarPerfil(usuarioActual);

  var exito = document.getElementById("mensajeExito");
  exito.textContent = "✅ Tus datos se actualizaron correctamente.";
  exito.classList.remove("oculto");
}

// PERFIL ADMIN — reemplaza el contenido del formulario
function cargarPerfilAdmin(usuario) {
  document.getElementById("avatarPerfil").textContent = "⚙️";
  document.getElementById("nombrePerfil").textContent = "Administrador";
  document.getElementById("correoPerfil").textContent = "Panel de administración";

  var contenido = document.getElementById("cuentaContenidoInner");
  if (!contenido) return;

  var totalUsuarios = JSON.parse(localStorage.getItem("usuarios") || "[]").length;
  var totalProductos = JSON.parse(localStorage.getItem("productosDB") || "[]")
    .filter(function(p) { return p.activo !== false; }).length;

  // Contar todos los pedidos
  var totalPedidos = 0;
  var pedidosProcesando = 0;
  for (var i = 0; i < localStorage.length; i++) {
    var clave = localStorage.key(i);
    if (clave && clave.indexOf("pedidos_") === 0) {
      var peds = JSON.parse(localStorage.getItem(clave) || "[]");
      totalPedidos += peds.length;
      pedidosProcesando += peds.filter(function(p) {
        return p.estado === "procesando";
      }).length;
    }
  }

  contenido.innerHTML =
    '<h2>Panel de administración</h2>' +
    '<p class="cuenta-subtitulo">Resumen general del sistema</p>' +

    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:16px;margin-bottom:28px;">' +

      '<div style="background:#ffeaea;border-radius:12px;padding:20px;text-align:center;">' +
        '<div style="font-size:2rem;margin-bottom:6px;">👥</div>' +
        '<div style="font-size:1.6rem;font-weight:800;color:var(--rojo);">' + totalUsuarios + '</div>' +
        '<div style="font-size:0.82rem;color:#888;margin-top:2px;">Usuarios registrados</div>' +
      '</div>' +

      '<div style="background:#eafaf1;border-radius:12px;padding:20px;text-align:center;">' +
        '<div style="font-size:2rem;margin-bottom:6px;">🛍</div>' +
        '<div style="font-size:1.6rem;font-weight:800;color:#1e8449;">' + totalProductos + '</div>' +
        '<div style="font-size:0.82rem;color:#888;margin-top:2px;">Productos activos</div>' +
      '</div>' +

      '<div style="background:#eaf2fd;border-radius:12px;padding:20px;text-align:center;">' +
        '<div style="font-size:2rem;margin-bottom:6px;">📦</div>' +
        '<div style="font-size:1.6rem;font-weight:800;color:#2471a3;">' + totalPedidos + '</div>' +
        '<div style="font-size:0.82rem;color:#888;margin-top:2px;">Pedidos totales</div>' +
      '</div>' +

      '<div style="background:#fff5e6;border-radius:12px;padding:20px;text-align:center;">' +
        '<div style="font-size:2rem;margin-bottom:6px;">⏳</div>' +
        '<div style="font-size:1.6rem;font-weight:800;color:#d68910;">' + pedidosProcesando + '</div>' +
        '<div style="font-size:0.82rem;color:#888;margin-top:2px;">En procesando</div>' +
      '</div>' +

    '</div>' +

    '<div style="display:flex;gap:12px;flex-wrap:wrap;">' +
      '<a href="admin.html" style="display:inline-flex;align-items:center;gap:8px;background:var(--rojo);color:white;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:700;font-size:0.92rem;">⚙️ Ir al panel admin</a>' +
      '<a href="pedidos.html" style="display:inline-flex;align-items:center;gap:8px;background:white;color:var(--rojo);border:2px solid var(--rojo);text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:700;font-size:0.92rem;">📦 Ver pedidos del sistema</a>' +
    '</div>';
}

window.onload = function() {
  var usuario = protegerPagina();
  if (!usuario) return;
  verificarSesion();

  if (usuario.esAdmin) {
    cargarPerfilAdmin(usuario);
  } else {
    cargarPerfil(usuario);
  }
};