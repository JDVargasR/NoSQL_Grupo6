let hideMenuTimeout;

document.addEventListener("DOMContentLoaded", async function () {
  const usuarioId = localStorage.getItem("usuarioId");

  if (!usuarioId) {
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/api/usuarios/${usuarioId}`);
    const usuario = await response.json();

    if (usuario && usuario.correo) {
      document.getElementById("correoUsuario").textContent = usuario.correo;
    } else {
      document.getElementById("correoUsuario").textContent = "Correo no disponible";
    }
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    document.getElementById("correoUsuario").textContent = "Error";
  }

  const dropdown = document.getElementById("usuarioDropdown");
  const menu = document.getElementById("menuDropdown");

  dropdown.addEventListener("mouseenter", () => {
    clearTimeout(hideMenuTimeout);
    menu.style.display = "block";
  });

  dropdown.addEventListener("mouseleave", () => {
    hideMenuTimeout = setTimeout(() => {
      menu.style.display = "none";
    }, 200); // Espera 200ms antes de ocultar
  });
});

function cerrarSesion() {
  localStorage.clear();
  window.location.href = "login.html";
}