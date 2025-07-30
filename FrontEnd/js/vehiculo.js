document.addEventListener("DOMContentLoaded", async () => {
  const modeloSelect = document.getElementById("modelo");
  const vehiculoForm = document.getElementById("vehiculoForm");

  // 🔹 1. Cargar el combo de modelos
  try {
    const response = await fetch("http://localhost:3000/api/vehiculos/modelos");
    const data = await response.json();

    // Agregar opciones al select
    data.forEach(({ idModelo, idTipoVehiculo, descripcion }) => {
      const option = document.createElement("option");
      option.value = idModelo;
      option.dataset.tipo = idTipoVehiculo;
      option.textContent = descripcion; // Modelo - Tipo
      modeloSelect.appendChild(option);
    });
  } catch (err) {
    console.error("Error cargando modelos:", err);
  }

  // 🔹 2. Manejar el submit del formulario
  vehiculoForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const idUsuario = 1; // puedes ajustarlo desde sesión
    const idModelo = modeloSelect.value;
    const idTipoVehiculo = modeloSelect.options[modeloSelect.selectedIndex].dataset.tipo;
    const placa = document.getElementById("placa").value;

    try {
      const response = await fetch("http://localhost:3000/api/vehiculos/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idUsuario, idModelo, placa, idTipoVehiculo })
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "¡Vehículo creado!",
          text: data.message,
          timer: 2000,
          showConfirmButton: false
        });

  
        tipoSelect.selectedIndex = 0;
        modeloInput.value = "";
        placaInput.value = "";
      } else {
        Swal.fire("Error", data.message, "error");
      }
    } catch (err) {
      Swal.fire("Error", "No se pudo registrar el vehículo", "error");
    }
  });
});

