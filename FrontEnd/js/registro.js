document.getElementById("registroForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value;
  const correo = document.getElementById("correo").value;
  const contrasenna = document.getElementById("contrasenna").value;

  try {
    const response = await fetch("http://localhost:3000/api/auth/registro", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ nombre, correo, contrasenna })
    });

    const data = await response.json();

    if (response.ok) {
      Swal.fire({
        icon: 'success',
        title: 'Registro exitoso',
        text: data.message,
        confirmButtonText: 'Iniciar sesión',
        confirmButtonColor: '#3085d6',
        scrollbarPadding: false,
        heightAuto: false
      }).then(() => {
        window.location.href = "login.html";
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: data.message,
        confirmButtonColor: '#f4b400',
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