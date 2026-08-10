// CHECKOUT

var metodoPagoSeleccionado = null;

function crearModalCheckout() {
  // FONDO
  var fondo = document.createElement("div");
  fondo.id = "fondoCheckout";
  fondo.onclick = cerrarCheckout;
  document.body.appendChild(fondo);

  // MODAL
  var modal = document.createElement("div");
  modal.id = "modalCheckout";
  modal.innerHTML =
    '<div class="checkout-header">' +
      '<h3>✅ Confirmar pedido</h3>' +
      '<button class="checkout-cerrar" onclick="cerrarCheckout()">✕</button>' +
    '</div>' +
    '<div class="checkout-cuerpo">' +

      // RESUMEN
      '<div class="checkout-seccion">' +
        '<h4>Resumen</h4>' +
        '<div id="checkoutItems"></div>' +
        '<div class="checkout-total">' +
          '<span>Total estimado</span>' +
          '<span id="checkoutTotal">S/ 0.00</span>' +
        '</div>' +
        '<p class="checkout-aviso">* El total es referencial. El personal confirmará el monto final al procesar tu pedido.</p>' +
      '</div>' +

      // MÉTODO DE PAGO
      '<div class="checkout-seccion">' +
        '<h4>Método de pago</h4>' +
        '<div class="pago-opciones">' +
          '<button class="pago-opcion" id="pagoEfectivo" onclick="seleccionarPago(\'efectivo\')">' +
            '<span class="pago-icono">💵</span>Efectivo' +
          '</button>' +
          '<button class="pago-opcion" id="pagoYape" onclick="seleccionarPago(\'yape\')">' +
            '<span class="pago-icono">📱</span>Yape / Plin' +
          '</button>' +
        '</div>' +
      '</div>' +

      // NOTA OPCIONAL
      '<div class="checkout-seccion">' +
        '<h4>Nota adicional <span style="font-weight:400;text-transform:none;letter-spacing:0;color:#bbb;">(opcional)</span></h4>' +
        '<textarea class="checkout-nota" id="checkoutNota" rows="2" placeholder="Ej: Vendré a recogerlo a las 3pm..."></textarea>' +
      '</div>' +

    '</div>' +
    '<div class="checkout-footer">' +
      '<button class="btn-confirmar" id="btnConfirmarPedido" onclick="confirmarPedido()">' +
        '📲 Confirmar y enviar por WhatsApp' +
      '</button>' +
      '<div class="checkout-error" id="checkoutError"></div>' +
    '</div>';

  document.body.appendChild(modal);
}

function abrirCheckout() {
  if (!carrito || carrito.length === 0) return;

  metodoPagoSeleccionado = null;

  // Limpiar selección de pago
  var btnE = document.getElementById("pagoEfectivo");
  var btnY = document.getElementById("pagoYape");
  if (btnE) btnE.classList.remove("seleccionado");
  if (btnY) btnY.classList.remove("seleccionado");

  // Limpiar nota y error
  var nota = document.getElementById("checkoutNota");
  var err  = document.getElementById("checkoutError");
  if (nota) nota.value = "";
  if (err)  err.textContent = "";

  // Renderizar items
  var contenedor = document.getElementById("checkoutItems");
  var totalEl    = document.getElementById("checkoutTotal");
  var total = 0;
  var html  = "";

  carrito.forEach(function(item) {
    var subtotal = item.precio * item.cantidad;
    total += subtotal;
    html +=
      '<div class="checkout-item">' +
        '<span class="checkout-item-nombre">' + item.nombre + '</span>' +
        '<span class="checkout-item-cant">x' + item.cantidad + '</span>' +
        '<span class="checkout-item-precio">S/ ' + subtotal.toFixed(2) + '</span>' +
      '</div>';
  });

  if (contenedor) contenedor.innerHTML = html;
  if (totalEl)    totalEl.textContent = "S/ " + total.toFixed(2);

  // Mostrar
  document.getElementById("fondoCheckout").classList.add("visible");
  document.getElementById("modalCheckout").classList.add("visible");
  document.body.style.overflow = "hidden";
}

function cerrarCheckout() {
  document.getElementById("fondoCheckout").classList.remove("visible");
  document.getElementById("modalCheckout").classList.remove("visible");
  document.body.style.overflow = "";
}

function seleccionarPago(metodo) {
  metodoPagoSeleccionado = metodo;
  document.getElementById("pagoEfectivo").classList.toggle("seleccionado", metodo === "efectivo");
  document.getElementById("pagoYape").classList.toggle("seleccionado",     metodo === "yape");
  document.getElementById("checkoutError").textContent = "";
}

function confirmarPedido() {
  // VALIDAR MÉTODO DE PAGO
  if (!metodoPagoSeleccionado) {
    document.getElementById("checkoutError").textContent = "⚠️ Selecciona un método de pago.";
    return;
  }

  var usuario = JSON.parse(localStorage.getItem("usuarioLogueado") || "null");
  if (!usuario) { irAlLogin(); return; }

  var nota = document.getElementById("checkoutNota").value.trim();

  // CALCULAR TOTAL
  var total = 0;
  carrito.forEach(function(item) { total += item.precio * item.cantidad; });

  // TEXTO MÉTODO DE PAGO
  var textoPago = metodoPagoSeleccionado === "efectivo" ? "Efectivo" : "Yape / Plin (QR)";

  // ARMAR MENSAJE WHATSAPP
  var lineas = carrito.map(function(item) {
    return "• " + item.nombre + " x" + item.cantidad;
  });

  var mensaje =
    "Hola! Soy *" + usuario.nombre + "* y quiero hacer el siguiente pedido:\n\n" +
    lineas.join("\n") +
    "\n\n💳 *Método de pago:* " + textoPago;

  if (nota) {
    mensaje += "\n📝 *Nota:* " + nota;
  }

  mensaje += "\n\nQuedo atento/a a la confirmación. ¡Gracias!";

  // GUARDAR EN HISTORIAL (estado: procesando)
  var clave   = "pedidos_" + usuario.correo;
  var pedidos = JSON.parse(localStorage.getItem(clave) || "[]");
  pedidos.push({
    id: Date.now(),
    fecha: new Date().toLocaleString("es-PE"),
    items: carrito.map(function(item) {
      return { nombre: item.nombre, cantidad: item.cantidad };
    }),
    total: total,
    metodoPago: textoPago,
    estado: "procesando"
  });
  localStorage.setItem(clave, JSON.stringify(pedidos));

  // VACIAR CARRITO
  carrito = [];
  guardarCarrito();
  actualizarCarrito();

  // CERRAR MODALES
  cerrarCheckout();
  cerrarPanelCarrito();

  // ABRIR WHATSAPP
  var numero = "51936625447";
  window.open("https://wa.me/" + numero + "?text=" + encodeURIComponent(mensaje), "_blank");
}

crearModalCheckout();