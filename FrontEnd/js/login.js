document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const correo = document.getElementById("correo").value;
  const contrasenna = document.getElementById("contrasenna").value;

  try {
    const response = await fetch("http://localhost:3000/api/usuarios/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ correo, contrasenna })
    });

    const data = await response.json();

    if (response.status === 200) {
      // Guardamos solo el ID del usuario
      localStorage.setItem("usuarioId", data.usuario._id);

      Swal.fire({
        icon: 'success',
        title: '¡Inicio de sesión exitoso!',
        text: `Bienvenido, ${data.usuario.nombre}`,
        confirmButtonColor: '#a5dc86',
        scrollbarPadding: false,
        heightAuto: false
      }).then(() => {
        window.location.href = "agenda.html";
      });

    } else if (response.status === 403) {
      Swal.fire({
        icon: 'warning',
        title: 'Usuario inactivo',
        text: data.mensaje || 'Usuario Inactivo, comuníquese con su administrador.',
        confirmButtonColor: '#f4b400',
        scrollbarPadding: false,
        heightAuto: false
      });

    } else if (response.status === 401) {
      Swal.fire({
        icon: 'warning',
        title: 'Acceso denegado',
        text: data.mensaje || 'Correo o contraseña incorrectos',
        confirmButtonColor: '#ffa500',
        scrollbarPadding: false,
        heightAuto: false
      });

    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: data.mensaje || 'Ocurrió un error inesperado.',
        confirmButtonColor: '#d33',
        scrollbarPadding: false,
        heightAuto: false
      });
    }

  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error del servidor',
      text: 'No se pudo conectar al backend.',
      confirmButtonColor: '#d33',
      scrollbarPadding: false,
      heightAuto: false
    });
  }
});