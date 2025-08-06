document.addEventListener("DOMContentLoaded", () => {
  const contenedorOpiniones = document.getElementById("contenedor-opiniones");

  fetch("/api/opiniones")
    .then((response) => response.json())
    .then((opiniones) => {
      opiniones.reverse(); // Opiniones recientes primero
      opiniones.forEach((op) => {
        const div = document.createElement("div");
        div.classList.add("opinion-card");

        div.innerHTML = `
          <p><strong>${op.usuario}</strong> dice:</p>
          <p>${op.comentario}</p>
          <p>Calificación: ⭐${op.calificacion}</p>
        `;

        contenedorOpiniones.appendChild(div);
      });
    })
    .catch((error) => {
      console.error("Error al obtener opiniones:", error);
      contenedorOpiniones.innerHTML = "<p>Error al cargar opiniones.</p>";
    });
});
