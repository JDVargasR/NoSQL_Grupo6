document.addEventListener("DOMContentLoaded", () => {
  const tablaBody = document.getElementById("tablaAgenda");
  const usuarioCorreo = document.getElementById("correoUsuario");
  const infoRegistros = document.getElementById("infoRegistros");

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
      heightAuto: false,
    }).then(() => {
      localStorage.clear();
      window.location.href = "login.html";
    });
    return;
  }

  // Validar que sea ADMIN
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
          heightAuto: false,
        }).then(() => {
          window.location.href = "login.html";
        });
        return;
      }

      if (usuarioCorreo) {
        usuarioCorreo.textContent = usuario.correo || "Administrador";
      }

      // Cargar reservas ACTIVAS
      cargarAgenda(usuarioId);
    })
    .catch((error) => {
      console.error("Error al validar usuario:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo validar el usuario.",
        icon: "error",
        confirmButtonText: "Volver al login",
        scrollbarPadding: false,
        heightAuto: false,
      }).then(() => {
        localStorage.clear();
        window.location.href = "login.html";
      });
    });

  function cargarAgenda(usuarioId) {
    fetch("http://localhost:3000/api/reservas/activas", {
      headers: { "x-usuario-id": usuarioId },
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
        console.log("📘 RESERVAS ACTIVAS:", reservas);
        tablaBody.innerHTML = "";

        if (!reservas || reservas.length === 0) {
          const fila = document.createElement("tr");
          const celda = document.createElement("td");
          celda.colSpan = 6;
          celda.textContent = "No hay reservas activas";
          celda.style.textAlign = "center";
          fila.appendChild(celda);
          tablaBody.appendChild(fila);
          if (infoRegistros)
            infoRegistros.textContent = "Mostrando 0 registros";
          return;
        }

        reservas.forEach((r, idx) => {
          const fila = document.createElement("tr");

          // #
          const tdIdx = document.createElement("td");
          tdIdx.textContent = `A-${idx + 1}`;

          // Cliente
          const tdCliente = document.createElement("td");
          tdCliente.textContent =
            (r.id_usuario && (r.id_usuario.nombre || r.id_usuario.correo)) ||
            "Usuario";

          // Vehículo
          const tdVeh = document.createElement("td");
          const marca = r.id_modelo?.marca || "Marca";
          const modelo = r.id_modelo?.modelo || "Modelo";
          const anio = r.id_modelo?.anio ? ` (${r.id_modelo.anio})` : "";
          tdVeh.textContent = `${marca} ${modelo}${anio}`;

          // Espacio
          const tdEsp = document.createElement("td");
          tdEsp.textContent =
            r.id_espacio?.numero_espacio != null
              ? `#${r.id_espacio.numero_espacio}`
              : "-";

          // Fecha (solo fecha, osea sin hora)
          const tdFecha = document.createElement("td");
          const fechaValida = r.fecha ? new Date(r.fecha) : null;
          tdFecha.textContent = fechaValida
            ? fechaValida.toLocaleDateString("es-CR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })
            : "Fecha no disponible";

          // Acción
          const tdAccion = document.createElement("td");
          const btnCompletar = document.createElement("button");
          btnCompletar.className = "btn-historial";
          btnCompletar.textContent = "Completar";
          btnCompletar.dataset.id = r._id;
          tdAccion.appendChild(btnCompletar);

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
        console.error("Error cargando agenda:", err);
        Swal.fire({
          title: "Error",
          text: err.message || "No se pudo cargar la agenda.",
          icon: "error",
          confirmButtonText: "Reintentar",
          showCancelButton: true,
          cancelButtonText: "Cancelar",
          scrollbarPadding: false,
          heightAuto: false,
        }).then((r) => r.isConfirmed && cargarAgenda(usuarioId));
      });
  }

  // Botón "Completar"
  document.getElementById("tablaAgenda").addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-historial");
    if (!btn) return;

    const reservaId = btn.dataset.id;
    Swal.fire({
      title: "Completar reserva",
      text: "Pronto habilitaremos esta acción.",
      icon: "info",
      confirmButtonText: "OK",
      scrollbarPadding: false,
      heightAuto: false,
    });
  });
});
