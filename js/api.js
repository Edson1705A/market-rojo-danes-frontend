// URL BASE DEL BACKEND
var API_URL = "http://localhost:3000/api";

// OBTENER TOKEN GUARDADO
function getToken() {
  return localStorage.getItem("token");
}

// GUARDAR SESIÓN TRAS LOGIN O REGISTRO
function guardarSesion(token, usuario) {
  usuario.esAdmin = usuario.es_admin || false;
  localStorage.setItem("token", token);
  localStorage.setItem("usuarioLogueado", JSON.stringify(usuario));
}

// CERRAR SESIÓN
function limpiarSesion() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuarioLogueado");
  localStorage.removeItem("carritoGuardado");
}

// PETICIÓN GENÉRICA
async function apiRequest(metodo, ruta, body, requireAuth) {
  var headers = { "Content-Type": "application/json" };

  if (requireAuth) {
    var token = getToken();
    if (!token) {
      irAlLogin();
      return null;
    }
    headers["Authorization"] = "Bearer " + token;
  }

  var opciones = { method: metodo, headers: headers };
  if (body) opciones.body = JSON.stringify(body);

  try {
    var response = await fetch(API_URL + ruta, opciones);
    var data     = await response.json();

    // TOKEN EXPIRADO
    if (response.status === 403 && data.mensaje && data.mensaje.includes("expirado")) {
      limpiarSesion();
      irAlLogin();
      return null;
    }

    return { status: response.status, data };

  } catch (error) {
    console.error("Error en API:", error);
    return null;
  }
}

// MÉTODOS CORTOS
function apiGet(ruta, requireAuth)       { return apiRequest("GET",    ruta, null,  requireAuth); }
function apiPost(ruta, body, requireAuth) { return apiRequest("POST",   ruta, body,  requireAuth); }
function apiPut(ruta, body, requireAuth)  { return apiRequest("PUT",    ruta, body,  requireAuth); }
function apiPatch(ruta, body, requireAuth){ return apiRequest("PATCH",  ruta, body,  requireAuth); }
function apiDelete(ruta, requireAuth)     { return apiRequest("DELETE", ruta, null,  requireAuth); }