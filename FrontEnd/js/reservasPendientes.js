document.addEventListener("DOMContentLoaded", () => {
  const tablaBody = document.getElementById("tablaReservasPendientes");
  const usuarioCorreo = document.getElementById("correoUsuario");
  const infoRegistros = document.getElementById("infoRegistros");

  const idUsuario = localStorage.getItem("usuarioId");
  const correoUsuario = localStorage.getItem("correo_usuario");

  if (!idUsuario || !correoUsuario) {
    usuarioCorreo.textContent = "Invitado";
    return;
  }

  usuarioCorreo.textContent = correoUsuario;

  fetch("http://localhost:3000/api/reservas/pendientes")
    .then(res => res.json())
    .then(reservas => {
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
        infoRegistros.textContent = "Mostrando 0 registros";
        return;
      }

      reservas.forEach((reserva, index) => {
        try {
          const fila = document.createElement("tr");

          const tdReserva = document.createElement("td");
          tdReserva.textContent = `R-${index + 1}`;

          const tdCliente = document.createElement("td");
          tdCliente.textContent = reserva.id_usuario?.nombre || "Desconocido";

          const tdVehiculo = document.createElement("td");
          const marca = reserva.id_modelo?.marca || "Marca";
          const modelo = reserva.id_modelo?.modelo || "Modelo";
          tdVehiculo.textContent = `${marca} ${modelo}`;

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

          const tdAccion = document.createElement("td");
          const btnConfirmar = document.createElement("button");
          btnConfirmar.classList.add("btn-historial");
          btnConfirmar.textContent = "Confirmar";
          tdAccion.appendChild(btnConfirmar);

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

      infoRegistros.textContent = `Mostrando registros del 1 al ${reservas.length} de un total de ${reservas.length} registros`;
    })
    .catch(err => {
      console.error("❌ Error al cargar reservas:", err);
      infoRegistros.textContent = "Error al cargar reservas";
    });
});
