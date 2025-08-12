document.addEventListener("DOMContentLoaded", () => {
  const tablaBody = document.getElementById("tablaReservasPendientes");
  const usuarioCorreo = document.getElementById("correoUsuario");
  const infoRegistros = document.getElementById("infoRegistros");

  // --- Sesión ---
  const idUsuario = localStorage.getItem("usuarioId");
  const tipoUsuario = localStorage.getItem("usuarioTipo"); // 'ADMIN' o 'CLIENTE'
  const correoUsuario = localStorage.getItem("correo_usuario"); // opcional (solo para mostrar)

  // Si no hay sesión, redirige a login
  if (!idUsuario) {
    window.location.href = "login.html";
    return;
  }

  // Solo ADMIN puede ver esta vista
  if (tipoUsuario !== "ADMIN") {
    // Redirige a la página principal del usuario no admin (ajusta si quieres otra)
    window.location.href = "agenda.html";
    return;
  }

  // Mostrar el correo si está en localStorage (opcional, no bloquea la carga)
  if (usuarioCorreo) {
    usuarioCorreo.textContent = correoUsuario || "Administrador";
  }

  // --- Cargar Reservas Pendientes (solo ADMIN) ---
  fetch("http://localhost:3000/api/reservas/pendientes", {
    headers: {
      "x-usuario-id": idUsuario // Middleware en backend valida ADMIN
    }
  })
    .then((res) => {
      if (!res.ok) {
        // Mensajes claros según código HTTP
        if (res.status === 401) throw new Error("No autenticado");
        if (res.status === 403) throw new Error("Acceso restringido a ADMIN");
        throw new Error(`Error HTTP ${res.status}`);
      }
      return res.json();
    })
    .then((reservas) => {
      console.log("📦 RESERVAS RECIBIDAS:", reservas);
      tablaBody.innerHTML = "";

      if (!reservas || reservas.length === 0) {
        const fila = document.createElement("tr");
        const celda = document.createElement("td");
        celda.colSpan = 5;
        celda.textContent = "No hay reservas pendientes";
        celda.style.textAlign = "center";
        fila.appendChild(celda);
        tablaBody.appendChild(fila);
        if (infoRegistros) infoRegistros.textContent = "Mostrando 0 registros";
        return;
      }

      reservas.forEach((reserva, index) => {
        try {
          const fila = document.createElement("tr");

          // Columna: Código/índice
          const tdReserva = document.createElement("td");
          tdReserva.textContent = `R-${index + 1}`;

          // Columna: Cliente
          const tdCliente = document.createElement("td");
          tdCliente.textContent =
            (reserva.id_usuario && (reserva.id_usuario.nombre || reserva.id_usuario.correo)) ||
            "Desconocido";

          // Columna: Vehículo
          const tdVehiculo = document.createElement("td");
          const marca = reserva.id_modelo?.marca || "Marca";
          const modelo = reserva.id_modelo?.modelo || "Modelo";
          tdVehiculo.textContent = `${marca} ${modelo}`;

          // Columna: Fecha
          const tdFecha = document.createElement("td");
          const fechaValida = reserva.fecha ? new Date(reserva.fecha) : null;
          const fechaFormateada = fechaValida
            ? fechaValida.toLocaleDateString("es-CR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })
            : "Fecha no disponible";
          tdFecha.textContent = fechaFormateada;

          // Columna: Acción
          const tdAccion = document.createElement("td");
          const btnConfirmar = document.createElement("button");
          btnConfirmar.classList.add("btn-historial");
          btnConfirmar.textContent = "Confirmar";
          btnConfirmar.dataset.id = reserva._id; // por si luego conectas la acción
          tdAccion.appendChild(btnConfirmar);

          // Armar fila
          fila.appendChild(tdReserva);
          fila.appendChild(tdCliente);
          fila.appendChild(tdVehiculo);
          fila.appendChild(tdFecha);
          fila.appendChild(tdAccion);

          tablaBody.appendChild(fila);
        } catch (e) {
          console.error("❌ Error procesando reserva individual:", reserva, e);
        }
      });

      if (infoRegistros) {
        infoRegistros.textContent = `Mostrando registros del 1 al ${reservas.length} de un total de ${reservas.length} registros`;
      }
    })
    .catch((err) => {
      console.error("❌ Error al cargar reservas:", err);
      if (infoRegistros) {
        infoRegistros.textContent =
          err.message === "Acceso restringido a ADMIN" || err.message === "No autenticado"
            ? err.message
            : "Error al cargar reservas";
      }
    });
});
