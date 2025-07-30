document.addEventListener("DOMContentLoaded", async () => {
  const tabla = document.getElementById("tablaVehiculos");
  const idUsuario = 1; // ⚠️ o tomarlo desde sesión

  try {
    const response = await fetch(`http://localhost:3000/api/listarvehiculo/usuario/${idUsuario}`);
    const vehiculos = await response.json();
    console.log("Vehículos:", vehiculos); // ✅ Verifica en consola del navegador

    vehiculos.forEach((vehiculo, index) => {
      const fila = document.createElement("tr");

      fila.innerHTML = `
        <td>${index + 1}</td>
        <td>${vehiculo.placa}</td>
        <td>${vehiculo.modelo}</td>
        <td>${vehiculo.tipo}</td>
        <td><span class="badge badge-success">${vehiculo.estado}</span></td>
        <td>
          <button class="btn-warning">Editar</button>
          <button class="btn-danger">Eliminar</button>
        </td>
        <td>
          <form method="POST" action="../Controllers/usarVehiculoHoy.php">
            <input type="hidden" name="placa" value="${vehiculo.placa}">
            <button type="submit" class="btn-naranja">Usar Hoy</button>
          </form>
        </td>
      `;

      tabla.appendChild(fila);
    });
  } catch (err) {
    console.error("Error al cargar vehículos:", err);
  }
});