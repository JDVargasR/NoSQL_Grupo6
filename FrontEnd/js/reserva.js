document.getElementById("formReserva").addEventListener("submit", async (e) => {
  e.preventDefault();

  const ID_Usuario = document.getElementById("idUsuario").value;
  const ID_Espacio = document.getElementById("idEspacio").value;

  try {
    const response = await fetch("http://localhost:3000/api/reservas/crear", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ID_Usuario, ID_Espacio })
    });

    const data = await response.json();

    if (response.ok) {
      Swal.fire({
        icon: "success",
        title: "¡Reserva guardada!",
        text: data.mensaje || "Reserva creada exitosamente.",
        confirmButtonColor: "#3085d6"
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Error al guardar",
        text: data.error || "No se pudo crear la reserva.",
        confirmButtonColor: "#d33"
      });
    }
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Error del servidor",
      text: "No se pudo conectar al servidor.",
      confirmButtonColor: "#d33"
    });
  }
});

