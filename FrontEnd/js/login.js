document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const correo = document.getElementById("correo").value;
  const contrasenna = document.getElementById("contrasenna").value;

  try {
    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ correo, contrasenna })
    });

    const data = await response.json();

    if (response.ok) {
      Swal.fire({
        icon: 'success',
        title: 'Inicio exitoso',
        text: data.message,
        confirmButtonText: 'Continuar',
        confirmButtonColor: '#3085d6',
        scrollbarPadding: false,
        heightAuto: false
      }).then(() => {
        window.location.href = "agenda.html"; // A la ruta a que se envia al usuario
      });
    } else {
      Swal.fire({ 
        icon: 'error',
        title: 'Error al iniciar sesión',
        text: data.message,
        confirmButtonColor: '#d33',
        scrollbarPadding: false,
        heightAuto: false
      });
    }
  } catch (err) {
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