function ocultarMensajesContacto() {
  document.getElementById("mensajeError").classList.add("oculto");
  document.getElementById("mensajeExito").classList.add("oculto");
}

function mostrarErrorContacto(msg) {
  var el = document.getElementById("mensajeError");
  el.textContent = msg;
  el.classList.remove("oculto");
}

function enviarContacto() {
  ocultarMensajesContacto();

  var nombre  = document.getElementById("inputNombre").value.trim();
  var correo  = document.getElementById("inputCorreo").value.trim();
  var asunto  = document.getElementById("inputAsunto").value;
  var mensaje = document.getElementById("inputMensaje").value.trim();

  if (!nombre || !correo || !mensaje) {
    mostrarErrorContacto("⚠️ Completa todos los campos obligatorios.");
    return;
  }
  if (!correo.includes("@")) {
    mostrarErrorContacto("⚠️ Ingresa un correo válido.");
    return;
  }
  if (mensaje.length < 10) {
    mostrarErrorContacto("⚠️ Tu mensaje es muy corto, cuéntanos un poco más.");
    return;
  }

  var mensajes = JSON.parse(localStorage.getItem("mensajesContacto") || "[]");
  mensajes.push({
    nombre: nombre,
    correo: correo,
    asunto: asunto,
    mensaje: mensaje,
    fecha: new Date().toLocaleString("es-PE")
  });
  localStorage.setItem("mensajesContacto", JSON.stringify(mensajes));

  var exito = document.getElementById("mensajeExito");
  exito.textContent = "✅ ¡Mensaje enviado! Te responderemos a la brevedad.";
  exito.classList.remove("oculto");

  document.getElementById("formContacto").reset();

  var btn = document.getElementById("btnEnviarContacto");
  btn.textContent = "Mensaje enviado";
  btn.disabled = true;
  setTimeout(function () {
    btn.textContent = "Enviar mensaje";
    btn.disabled = false;
  }, 3000);
}