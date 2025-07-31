document.getElementById("registroForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value;
  const correo = document.getElementById("correo").value;
  const contrasenna = document.getElementById("contrasenna").value;

  try {
    const response = await fetch("http://localhost:3000/api/usuarios/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, correo, contrasenna })
    });

    const data = await response.json();

    if (response.ok) {
      Swal.fire({
        icon: "success",
        title: "¡Registro exitoso!",
        text: "Su cuenta ha sido creada correctamente.",
        confirmButtonText: "Iniciar sesión",
        confirmButtonColor: "#a5dc86"
      }).then(() => {
        window.location.href = "login.html";
      });
    } else {
      let mensaje = data.error || "No se pudo registrar.";
      let color = "#f4b400";

      // Si es error por correo duplicado
      if (mensaje.includes("E11000")) {
        mensaje = "El correo ya está registrado.";
      }

      Swal.fire({
        icon: "warning",
        title: "Error",
        text: mensaje,
        confirmButtonColor: color
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