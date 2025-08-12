document.addEventListener("DOMContentLoaded", () => {
  const tablaBody =
    document.getElementById("tablaHistorial") ||
    document.querySelector("table tbody");

  const usuarioCorreo = document.getElementById("correoUsuario");
  const infoRegistros = document.getElementById("infoRegistros");

  if (!tablaBody) {
    Swal.fire({
      title: "Error de estructura",
      text: "No se encontró el cuerpo de la tabla (tbody) para el historial.",
      icon: "error",
      confirmButtonText: "OK",
      scrollbarPadding: false,
      heightAuto: false
    });
    return;
  }

  const usuarioId = localStorage.getItem("usuarioId");
  const isValidObjectId = (id) => typeof id === "string" && id.length === 24;

  // Validar sesión
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

  // Validar que sea ADMIN (y activo)
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
          confirmButtonText: "Iniciar sesión como admin",
          scrollbarPadding: false,
          heightAuto: false
        }).then(() => {
          window.location.href = "login.html";
        });
        return;
      }

      if (usuarioCorreo) {
        usuarioCorreo.textContent = usuario.correo || "Administrador";
      }

      // Cargar reservas COMPLETADAS
      cargarHistorial(usuarioId);
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

  function cargarHistorial(uid) {
    fetch("http://localhost:3000/api/reservas/completadas", {
      headers: { "x-usuario-id": uid }
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
        console.log("📗 RESERVAS COMPLETADAS:", reservas);
        tablaBody.innerHTML = "";

        if (!reservas || reservas.length === 0) {
          const fila = document.createElement("tr");
          const celda = document.createElement("td");
          celda.colSpan = 6;
          celda.textContent = "No hay reservas completadas";
          celda.style.textAlign = "center";
          fila.appendChild(celda);
          tablaBody.appendChild(fila);
          if (infoRegistros) infoRegistros.textContent = "Mostrando 0 registros";
          return;
        }

        reservas.forEach((r, idx) => {
          const fila = document.createElement("tr");

          // #
          const tdIdx = document.createElement("td");
          tdIdx.textContent = `R-${idx + 1}`;

          // Cliente
          const tdCliente = document.createElement("td");
          tdCliente.textContent =
            (r.id_usuario && (r.id_usuario.nombre || r.id_usuario.correo)) || "Usuario";

          // Vehículo
          const tdVeh = document.createElement("td");
          const marca = r.id_modelo?.marca || "Marca";
          const modelo = r.id_modelo?.modelo || "Modelo";
          const anio = r.id_modelo?.anio ? ` (${r.id_modelo.anio})` : "";
          tdVeh.textContent = `${marca} ${modelo}${anio}`;

          // Espacio
          const tdEsp = document.createElement("td");
          tdEsp.textContent =
            r.id_espacio?.numero_espacio != null ? `#${r.id_espacio.numero_espacio}` : "-";

          // Fecha (usa fecha_completada si existe, si no, fecha)
          const tdFecha = document.createElement("td");
          const fechaBase = r.fecha_completada || r.fecha;
          const fechaValida = fechaBase ? new Date(fechaBase) : null;
          tdFecha.textContent = fechaValida
            ? fechaValida.toLocaleDateString("es-CR", { year: "numeric", month: "2-digit", day: "2-digit" })
            : "Fecha no disponible";

          // Acción (Eliminar)
          const tdAccion = document.createElement("td");
          const btnEliminar = document.createElement("button");
          btnEliminar.className = "btn-eliminar"; 
          btnEliminar.textContent = "Eliminar";
          btnEliminar.dataset.id = r._id;
          tdAccion.appendChild(btnEliminar);

          fila.appendChild(tdIdx);
          fila.appendChild(tdCliente);
          fila.appendChild(tdVeh);
          fila.appendChild(tdEsp);
          fila.appendChild(tdFecha);
          fila.appendChild(tdAccion);

          tablaBody.appendChild(fila);
        });

        if (infoRegistros) {
          infoRegistros.textContent = `Mostrando ${reservas.length} registro(s)`;
        }
      })
      .catch((err) => {
        console.error("Error cargando historial:", err);
        Swal.fire({
          title: "Error",
          text: err.message || "No se pudo cargar el historial.",
          icon: "error",
          confirmButtonText: "Reintentar",
          showCancelButton: true,
          cancelButtonText: "Cancelar",
          scrollbarPadding: false,
          heightAuto: false
        }).then((r) => r.isConfirmed && cargarHistorial(usuarioId));
      });
  }

  // 4) Delegación: Eliminar
  tablaBody.addEventListener("click", (e) => {
    const btnEliminar = e.target.closest(".btn-eliminar");
    if (!btnEliminar) return;

    const reservaId = btnEliminar.dataset.id;
    confirmarEliminar(reservaId);
  });

  function confirmarEliminar(reservaId) {
    Swal.fire({
      title: "¿Eliminar reserva del historial?",
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
            text: "La reserva fue eliminada del historial.",
            icon: "success",
            confirmButtonText: "OK",
            scrollbarPadding: false,
            heightAuto: false
          });
          cargarHistorial(usuarioId);
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