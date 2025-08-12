document.addEventListener("DOMContentLoaded", () => {
  const tablaBody = document.getElementById("tablaReservasPendientes");
  const usuarioCorreo = document.getElementById("correoUsuario");
  const infoRegistros = document.getElementById("infoRegistros");

  const usuarioId = localStorage.getItem("usuarioId");
  const isValidObjectId = (id) => typeof id === "string" && id.length === 24;

  // Validación de sesión - Frontend
  if (!usuarioId || !isValidObjectId(usuarioId)) {
    Swal.fire({
      title: "Sesión inválida",
      text: "Tu sesión ha expirado o el ID del usuario es inválido.",
      icon: "warning",
      confirmButtonText: "Ir al login",
      scrollbarPadding: false,
      heightAuto: false
    }).then(() => {
      localStorage.clear();
      window.location.href = "login.html";
    });
    return;
  }

  // Validar rol con backend
  fetch(`http://localhost:3000/api/usuarios/${usuarioId}`)
    .then((res) => {
      if (!res.ok) throw new Error("No se pudo obtener el usuario");
      return res.json();
    })
    .then((usuario) => {
      if (!usuario || usuario.tipo !== "ADMIN" || usuario.estado !== "ACTIVO") {
        Swal.fire({
          title: "Acceso denegado",
          text: "Esta sección es solo para administradores activos.",
          icon: "warning",
          confirmButtonText: "Volver al inicio",
          scrollbarPadding: false,
          heightAuto: false
        }).then(() => (window.location.href = "agenda.html"));
        return;
      }

      if (usuarioCorreo) {
        usuarioCorreo.textContent = usuario.correo || "Administrador";
      }

      // Cargar tabla
      cargarReservasPendientes(usuarioId);
    })
    .catch((error) => {
      console.error("Error al validar usuario:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo validar el usuario.",
        icon: "error",
        confirmButtonText: "Volver al login",
        scrollbarPadding: false,
        heightAuto: false
      }).then(() => {
        localStorage.clear();
        window.location.href = "login.html";
      });
    });

  function cargarReservasPendientes(usuarioId) {
    fetch("http://localhost:3000/api/reservas/pendientes", {
      headers: { "x-usuario-id": usuarioId }
    })
      .then((res) => {
        if (!res.ok) {
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
          celda.colSpan = 6; // índice, cliente, vehículo, espacio, fecha, acción
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

            // Columna: Espacio
            const tdEspacio = document.createElement("td");
            const espacio =
              reserva.id_espacio && reserva.id_espacio.numero_espacio != null
                ? `#${reserva.id_espacio.numero_espacio}`
                : "-";
            tdEspacio.textContent = espacio;

            // Columna: Fecha
            const tdFecha = document.createElement("td");
            const fechaValida = reserva.fecha ? new Date(reserva.fecha) : null;
            const fechaFormateada = fechaValida
              ? fechaValida.toLocaleDateString("es-CR", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit"
                })
              : "Fecha no disponible";
            tdFecha.textContent = fechaFormateada;

            // Columna: Acción (Confirmar + Eliminar)
            const tdAccion = document.createElement("td");

            const btnConfirmar = document.createElement("button");
            btnConfirmar.classList.add("btn-historial");
            btnConfirmar.textContent = "Confirmar";
            btnConfirmar.dataset.id = reserva._id;

            const btnEliminar = document.createElement("button");
            btnEliminar.classList.add("btn-eliminar");
            btnEliminar.textContent = "Eliminar";
            btnEliminar.dataset.id = reserva._id;

            tdAccion.appendChild(btnConfirmar);
            tdAccion.appendChild(btnEliminar);

            // Armar fila
            fila.appendChild(tdReserva);
            fila.appendChild(tdCliente);
            fila.appendChild(tdVehiculo);
            fila.appendChild(tdFecha);
            fila.appendChild(tdEspacio);
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

        if (err.message === "No autenticado" || err.message === "Acceso restringido a ADMIN") {
          Swal.fire({
            title: err.message,
            text: "No tienes permisos para ver esta sección.",
            icon: "warning",
            confirmButtonText: "Volver al inicio",
            scrollbarPadding: false,
            heightAuto: false
          }).then(() => (window.location.href = "agenda.html"));
          return;
        }

        if (infoRegistros) infoRegistros.textContent = "Error al cargar reservas";
        Swal.fire({
          title: "Error",
          text: "Ocurrió un problema al cargar las reservas.",
          icon: "error",
          confirmButtonText: "Reintentar",
          showCancelButton: true,
          cancelButtonText: "Cancelar",
          scrollbarPadding: false,
          heightAuto: false
        }).then((r) => {
          if (r.isConfirmed) cargarReservasPendientes(usuarioId);
        });
      });
  }

  // Confirmar y Eliminar
  tablaBody.addEventListener("click", (e) => {
    const btnConfirmar = e.target.closest(".btn-historial");
    const btnEliminar = e.target.closest(".btn-eliminar");

    // Confirmar
    if (btnConfirmar) {
      const reservaId = btnConfirmar.dataset.id;
      confirmarReserva(reservaId);
      return;
    }

    // Eliminar
    if (btnEliminar) {
      const reservaId = btnEliminar.dataset.id;
      confirmarEliminar(reservaId);
      return;
    }
  });

  function confirmarReserva(reservaId) {
    Swal.fire({
      title: "¿Confirmar reserva?",
      text: "Se activará la reserva y quedará lista para uso.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, confirmar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      scrollbarPadding: false,
      heightAuto: false
    }).then((r) => {
      if (!r.isConfirmed) return;

      const btns = document.querySelectorAll(`[data-id="${reservaId}"]`);
      btns.forEach((b) => (b.disabled = true));

      fetch(`http://localhost:3000/api/reservas/${reservaId}/confirmar`, {
        method: "PATCH",
        headers: { "x-usuario-id": usuarioId, "Content-Type": "application/json" }
      })
        .then(async (res) => {
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
              throw new Error(data.error || "No autorizado");
            }
            throw new Error(data.error || `Error HTTP ${res.status}`);
          }
          return data;
        })
        .then(() => {
          Swal.fire({
            title: "Reserva confirmada",
            text: "La reserva fue activada correctamente.",
            icon: "success",
            confirmButtonText: "OK",
            scrollbarPadding: false,
            heightAuto: false
          });
          cargarReservasPendientes(usuarioId);
        })
        .catch((err) => {
          console.error("Error confirmando reserva:", err);
          Swal.fire({
            title: "No se pudo confirmar",
            text: err.message || "Intenta nuevamente.",
            icon: "error",
            confirmButtonText: "OK",
            scrollbarPadding: false,
            heightAuto: false
          });
        })
        .finally(() => {
          btns.forEach((b) => (b.disabled = false));
        });
    });
  }

  function confirmarEliminar(reservaId) {
    Swal.fire({
      title: "¿Eliminar reserva?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      scrollbarPadding: false,
      heightAuto: false
    }).then((r) => {
      if (!r.isConfirmed) return;

      fetch(`http://localhost:3000/api/reservas/${reservaId}`, {
        method: "DELETE",
        headers: { "x-usuario-id": usuarioId }
      })
        .then(async (res) => {
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
              throw new Error(data.error || "No autorizado");
            }
            throw new Error(data.error || `Error HTTP ${res.status}`);
          }
          return data;
        })
        .then(() => {
          Swal.fire({
            title: "Eliminada",
            text: "La reserva fue eliminada correctamente.",
            icon: "success",
            confirmButtonText: "OK",
            scrollbarPadding: false,
            heightAuto: false
          });
          cargarReservasPendientes(usuarioId);
        })
        .catch((err) => {
          console.error("Error eliminando reserva:", err);
          Swal.fire({
            title: "No se pudo eliminar",
            text: err.message || "Intenta nuevamente.",
            icon: "error",
            confirmButtonText: "OK",
            scrollbarPadding: false,
            heightAuto: false
          });
        });
    });
  }
});