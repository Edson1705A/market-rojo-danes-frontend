// MOSTRAR Y OCULTAR CONTRASEÑA
function verPassword(idInput) {
  var input = document.getElementById(idInput);
  input.type = input.type === "password" ? "text" : "password";
}

function mostrarError(mensaje) {
  var el = document.getElementById("mensajeError");
  if (!el) return;
  el.textContent = mensaje;
  el.classList.remove("oculto");
}

function ocultarMensajes() {
  var error = document.getElementById("mensajeError");
  var exito = document.getElementById("mensajeExito");
  if (error) error.classList.add("oculto");
  if (exito) exito.classList.add("oculto");
}

// BARRA DE SEGURIDAD
function BarraSeguridad() {
  var campo = document.getElementById("inputPassword");
  var barra = document.getElementById("barraSeguridad");
  var texto = document.getElementById("textoSeguridad");
  if (!campo || !barra || !texto) return;

  campo.addEventListener("input", function() {
    var valor = campo.value;
    var nivel = 0;
    if (valor.length >= 6) nivel++;
    if (/[A-Z]/.test(valor)) nivel++;
    if (/[0-9]/.test(valor)) nivel++;
    if (/[^A-Za-z0-9]/.test(valor)) nivel++;

    var niveles = {
      0: { ancho: "0%",   color: "",        label: "" },
      1: { ancho: "25%",  color: "#e74c3c", label: "Muy débil" },
      2: { ancho: "50%",  color: "#e67e22", label: "Débil" },
      3: { ancho: "75%",  color: "#f1c40f", label: "Buena" },
      4: { ancho: "100%", color: "#27ae60", label: "Muy segura" }
    };

    barra.style.width      = niveles[nivel].ancho;
    barra.style.background = niveles[nivel].color;
    texto.textContent      = niveles[nivel].label;
    texto.style.color      = niveles[nivel].color;
  });
}

// INICIAR SESIÓN
async function iniciarSesion() {
  ocultarMensajes();

  var identificador = document.getElementById("inputUsuario").value.trim();
  var password      = document.getElementById("inputPassword").value;

  if (!identificador || !password) {
    mostrarError("⚠️ Completa todos los campos.");
    return;
  }

  var resultado = await apiPost("/auth/login", { identificador, password });

  if (!resultado) {
    mostrarError("⚠️ Error de conexión con el servidor.");
    return;
  }

  if (!resultado.data.ok) {
    mostrarError("⚠️ " + resultado.data.mensaje);
    return;
  }

  // GUARDAR SESIÓN
  guardarSesion(resultado.data.token, resultado.data.usuario);

  // REDIRIGIR SEGÚN ROL
  if (resultado.data.usuario.es_admin || resultado.data.usuario.esAdmin) {
    window.location.href = "admin.html";
  } else {
    window.location.href = "../index.html";
  }
}

// REGISTRARSE
async function registrarse() {
  ocultarMensajes();

  var nombre    = document.getElementById("inputNombre").value.trim();
  var username  = document.getElementById("inputUsername").value.trim();
  var correo    = document.getElementById("inputCorreo").value.trim();
  var telefono  = document.getElementById("inputTelefono").value.trim();
  var dni       = document.getElementById("inputDni") ? document.getElementById("inputDni").value.trim() : "";
  var password  = document.getElementById("inputPassword").value;
  var confirmar = document.getElementById("inputConfirmar").value;
  var terminos  = document.getElementById("checkTerminos").checked;

  // VALIDACIONES
  if (!nombre || !username || !correo || !password || !confirmar) {
    mostrarError("⚠️ Completa todos los campos obligatorios.");
    return;
  }
  if (!correo.includes("@")) {
    mostrarError("⚠️ Ingresa un correo válido.");
    return;
  }
  if (password.length < 6) {
    mostrarError("⚠️ La contraseña debe tener al menos 6 caracteres.");
    return;
  }
  if (password !== confirmar) {
    mostrarError("⚠️ Las contraseñas no coinciden.");
    return;
  }
  if (!terminos) {
    mostrarError("⚠️ Debes aceptar los Términos y condiciones.");
    return;
  }

  var resultado = await apiPost("/auth/registro", {
    nombre, username, correo, telefono, dni, password
  });

  if (!resultado) {
    mostrarError("⚠️ Error de conexión con el servidor.");
    return;
  }

  if (!resultado.data.ok) {
    mostrarError("⚠️ " + resultado.data.mensaje);
    return;
  }

  // GUARDAR SESIÓN Y REDIRIGIR
  guardarSesion(resultado.data.token, resultado.data.usuario);

  var exito = document.getElementById("mensajeExito");
  exito.textContent = "✅ Cuenta creada exitosamente. Redirigiendo...";
  exito.classList.remove("oculto");

  setTimeout(function() {
    window.location.href = "../index.html";
  }, 1500);
}

// REDES SOCIALES
function authGoogle(modo) {
  mostrarAlerta("Próximamente: inicio con Google", "info");
}
function authFacebook(modo) {
  mostrarAlerta("Próximamente: inicio con Facebook", "info");
}

// RECUPERAR CONTRASEÑA
async function recuperarPassword() {
  ocultarMensajes();

  var correo = document.getElementById("inputCorreo").value.trim();

  if (!correo) {
    mostrarError("⚠️ Ingresa tu correo electrónico.");
    return;
  }
  if (!correo.includes("@")) {
    mostrarError("⚠️ Ingresa un correo válido.");
    return;
  }

  var exito = document.getElementById("mensajeExito");
  exito.innerHTML =
    "✅ Solicitud recibida. Si tu correo está registrado, " +
    "el personal de <strong>Rojo Danés</strong> se pondrá en contacto contigo " +
    "para ayudarte a recuperar tu acceso.<br>" +
    "<small style='color:#888;font-size:0.8rem;margin-top:4px;display:block;'>" +
    "También puedes escribirnos directamente al " +
    "<a href='https://wa.me/51952822589' style='color:var(--rojo);'>WhatsApp de la tienda</a>." +
    "</small>";
  exito.classList.remove("oculto");

  var btn = document.querySelector(".btn-auth");
  btn.textContent       = "Correo enviado";
  btn.disabled          = true;
  btn.style.background  = "#27ae60";
  btn.style.borderColor = "#27ae60";
  btn.style.color       = "white";
}

// ENTER PARA ENVIAR
window.onload = function() {
  BarraSeguridad();
  document.addEventListener("keyup", function(e) {
    if (e.key !== "Enter") return;
    if (document.getElementById("inputConfirmar")) {
      registrarse();
    } else if (document.getElementById("inputUsuario")) {
      iniciarSesion();
    }
  });
};