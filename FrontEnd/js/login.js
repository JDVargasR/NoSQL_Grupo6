document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const correo = document.getElementById("correo").value;
  const contrasenna = document.getElementById("contrasenna").value;

  try {
    const response = await fetch("http://localhost:3000/api/usuarios/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ correo, contrasenna }),
    });

    const resultado = await response.json();

    if (response.ok) {
      Swal.fire({
        icon: "success",
        title: "¡Inicio de sesión exitoso!",
        text: `Bienvenido, ${resultado.usuario.nombre}`,
        confirmButtonColor: "#a5dc86"
      }).then(() => {
        window.location.href = "agenda.html";
      });
    } else {
      Swal.fire({
        icon: "warning",
        title: "Acceso denegado",
        text: resultado.mensaje || "Correo o contraseña incorrectos",
        confirmButtonColor: "#ffa500"
      });
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error del servidor",
      text: "No se pudo conectar al servidor.",
      confirmButtonColor: "#d33"
    });
  }
});