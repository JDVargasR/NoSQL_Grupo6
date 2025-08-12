document.addEventListener("DOMContentLoaded", () => {
  const idUsuarioInput = document.getElementById("idUsuario");
  const idModeloSelect = document.getElementById("idModelo");
  const idEspacioSelect = document.getElementById("idEspacio");
  const formReserva = document.getElementById("formReserva");

  const usuarioId = localStorage.getItem("usuarioId");
  if (!usuarioId) {
    Swal.fire({
      title: "Sesión no iniciada",
      text: "Por favor, inicia sesión",
      icon: "warning",
      confirmButtonText: "Ir al login"
    }).then(() => window.location.href = "login.html");
    return;
  }

  idUsuarioInput.value = usuarioId;

  // Cargar modelos
  fetch("http://localhost:3000/api/modelos")
    .then(res => res.json())
    .then(modelos => {
      modelos.forEach(m => {
        const option = document.createElement("option");
        option.value = m._id;
        option.textContent = `${m.marca} ${m.modelo} (${m.anio})`;
        idModeloSelect.appendChild(option);
      });
    })
    .catch(err => console.error("Error al cargar modelos", err));

  // Cargar espacios
  fetch("http://localhost:3000/api/espacios")
    .then(res => res.json())
    .then(espacios => {
      espacios.forEach(e => {
        const option = document.createElement("option");
        option.value = e._id;
        option.textContent = `Espacio #${e.numero_espacio}`;
        idEspacioSelect.appendChild(option);
      });
    })
    .catch(err => console.error("Error al cargar espacios", err));

  // Guardar reserva
  formReserva.addEventListener("submit", async (e) => {
    e.preventDefault();

    const datos = {
      id_usuario: usuarioId,
      id_modelo: idModeloSelect.value,
      id_espacio: idEspacioSelect.value,
      estado: "INACTIVO"  // Cambia esto si deseas iniciar con otro estado como "PENDIENTE"
    };

    try {
      const res = await fetch("http://localhost:3000/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire("Reserva creada", "La reserva fue registrada exitosamente", "success")
          .then(() => window.location.href = "crearReservas.html");
      } else {
        Swal.fire("Error", data.error || "No se pudo crear la reserva", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Error al crear la reserva", "error");
    }
  });
});